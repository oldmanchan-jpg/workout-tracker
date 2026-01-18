import json
import re
import sys
import zipfile
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from xml.etree import ElementTree as ET


NS_MAIN = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
NS_RELS = {"r": "http://schemas.openxmlformats.org/package/2006/relationships"}


def _slugify(text: str) -> str:
    s = text.lower().strip()
    s = re.sub(r"[^\w\s-]", "", s)
    s = re.sub(r"[\s_-]+", "-", s)
    s = re.sub(r"^-+|-+$", "", s)
    return s or "template"


def _clean_text(v: Optional[str]) -> Optional[str]:
    if v is None:
        return None
    s = str(v).replace("\u00a0", " ").strip()
    return s if s else None


def _parse_int(v: Optional[str]) -> Optional[int]:
    s = _clean_text(v)
    if not s:
        return None
    m = re.search(r"(\d+)", s)
    if not m:
        return None
    try:
        return int(m.group(1))
    except Exception:
        return None


def _parse_number(v: Optional[str]) -> Optional[float]:
    s = _clean_text(v)
    if not s:
        return None
    # Support "100 kg", "12.5", "12,5"
    m = re.search(r"(\d+(?:[.,]\d+)?)", s)
    if not m:
        return None
    try:
        return float(m.group(1).replace(",", "."))
    except Exception:
        return None


def _looks_like_day_header(a: str) -> Optional[Tuple[int, str]]:
    """
    Returns (day_number, normalized_header_text_without_week_prefix) if this cell is a day header.
    Examples:
      "DAY 1 - FULL BODY STRENGTH ..." -> (1, "DAY 1 - FULL BODY STRENGTH ...")
      "GIORNO 2 - CONDITIONING (EMOM Format)" -> (2, "DAY 2 - CONDITIONING (EMOM Format)")
    """
    s = _clean_text(a)
    if not s:
        return None
    m = re.match(r"^(DAY|GIORNO)\s*(\d+)\s*-\s*(.+)$", s.strip(), flags=re.IGNORECASE)
    if not m:
        return None
    day_num = int(m.group(2))
    rest = m.group(3).strip()
    normalized = f"DAY {day_num} - {rest}"
    return day_num, normalized


def _section_type_from_name(workout_name: str) -> str:
    up = workout_name.upper()
    if "EMOM" in up:
        return "emom"
    if "CIRCUIT" in up or "CIRCUITO" in up:
        return "circuit"
    if "STRENGTH" in up or "FORZA" in up:
        return "strength"
    # Default to strength to match app behavior
    return "strength"


def _extract_after_colon_or_strip_prefix(text: str, prefix_regex: str) -> str:
    s = _clean_text(text) or ""
    if ":" in s:
        # Keep what's after the last colon (handles "Minuto A (...) : Exercise")
        after = s.split(":")[-1].strip()
        return after if after else s
    # Otherwise strip the prefix pattern
    stripped = re.sub(prefix_regex, "", s, flags=re.IGNORECASE).strip()
    return stripped if stripped else s


@dataclass
class SheetGrid:
    name: str
    # (row_number, col_letters) -> value
    cells: Dict[Tuple[int, str], str]
    max_row: int

    def get(self, row: int, col: str) -> Optional[str]:
        return _clean_text(self.cells.get((row, col.upper())))

    def col_a(self, row: int) -> Optional[str]:
        return self.get(row, "A")

    def col_b(self, row: int) -> Optional[str]:
        return self.get(row, "B")

    def iter_rows(self, start: int, end: int) -> List[int]:
        if end < start:
            return []
        return list(range(start, min(end, self.max_row) + 1))


def _parse_xlsx_sheet_xml(sheet_name: str, xml_bytes: bytes) -> SheetGrid:
    root = ET.fromstring(xml_bytes)
    cells: Dict[Tuple[int, str], str] = {}
    max_row = 0

    sheet_data = root.find("m:sheetData", NS_MAIN)
    if sheet_data is None:
        return SheetGrid(name=sheet_name, cells=cells, max_row=0)

    for row_el in sheet_data.findall("m:row", NS_MAIN):
        r_attr = row_el.get("r")
        if not r_attr:
            continue
        try:
            row_num = int(r_attr)
        except Exception:
            continue
        max_row = max(max_row, row_num)

        for c_el in row_el.findall("m:c", NS_MAIN):
            ref = c_el.get("r")  # e.g. "A12"
            if not ref:
                continue
            m = re.match(r"^([A-Z]+)(\d+)$", ref)
            if not m:
                continue
            col_letters = m.group(1)

            cell_type = c_el.get("t")
            text_val: Optional[str] = None
            if cell_type == "inlineStr":
                is_el = c_el.find("m:is", NS_MAIN)
                if is_el is not None:
                    # inline string may have multiple <t> nodes; join them
                    parts = [t_el.text or "" for t_el in is_el.findall(".//m:t", NS_MAIN)]
                    text_val = "".join(parts)
            else:
                # For our workbook, most meaningful strings are inlineStr.
                v_el = c_el.find("m:v", NS_MAIN)
                if v_el is not None and v_el.text is not None:
                    text_val = v_el.text

            text_val = _clean_text(text_val)
            if text_val:
                cells[(row_num, col_letters)] = text_val

    return SheetGrid(name=sheet_name, cells=cells, max_row=max_row)


def _load_workbook_sheets(xlsx_path: Path) -> List[Tuple[str, bytes]]:
    """
    Returns list of (sheet_name, sheet_xml_bytes) in workbook order.
    """
    with zipfile.ZipFile(xlsx_path, "r") as zf:
        workbook_xml = zf.read("xl/workbook.xml")
        rels_xml = zf.read("xl/_rels/workbook.xml.rels")

    wb_root = ET.fromstring(workbook_xml)
    rels_root = ET.fromstring(rels_xml)

    # Map rId -> Target
    rid_to_target: Dict[str, str] = {}
    for rel in rels_root.findall("r:Relationship", NS_RELS):
        rid = rel.get("Id")
        target = rel.get("Target")
        if rid and target:
            rid_to_target[rid] = target

    sheets_el = wb_root.find("m:sheets", NS_MAIN)
    if sheets_el is None:
        return []

    ordered: List[Tuple[str, str]] = []
    for sheet in sheets_el.findall("m:sheet", NS_MAIN):
        name = sheet.get("name")
        rid = sheet.get("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id")
        if not name or not rid:
            continue
        target = rid_to_target.get(rid)
        if not target:
            continue
        # Targets may be absolute like "/xl/worksheets/sheet1.xml" or relative like "worksheets/sheet1.xml"
        target_norm = target.lstrip("./").lstrip("/")
        if target_norm.lower().startswith("xl/"):
            sheet_path = target_norm
        else:
            sheet_path = f"xl/{target_norm}"
        ordered.append((name, sheet_path))

    out: List[Tuple[str, bytes]] = []
    with zipfile.ZipFile(xlsx_path, "r") as zf:
        for sheet_name, sheet_path in ordered:
            out.append((sheet_name, zf.read(sheet_path)))
    return out


def _extract_warmup(grid: SheetGrid, start_row: int, end_row: int) -> List[Dict[str, str]]:
    warmup_header = None
    main_header = None
    for r in grid.iter_rows(start_row, end_row):
        a = (grid.col_a(r) or "").upper()
        if warmup_header is None and "RISCALDAMENTO" in a:
            warmup_header = r
        if "ALLENAMENTO PRINCIPALE" in a:
            main_header = r
            break
    if warmup_header is None or main_header is None or main_header <= warmup_header:
        return []

    items: List[Dict[str, str]] = []
    for r in grid.iter_rows(warmup_header + 1, main_header - 1):
        label = grid.col_a(r)
        target = grid.col_b(r)
        if not label or not target:
            continue
        # Skip column header rows if they appear
        if label.strip().upper() in {"ESERCIZIO / SEZIONE", "EXERCISE SELECTION"}:
            continue
        items.append({"label": label, "target": target})
    return items


def extract_strength_workout(grid: SheetGrid, start_row: int, end_row: int, workout_name: str) -> Dict:
    header_row = None
    for r in grid.iter_rows(start_row, min(end_row, start_row + 6)):
        if (grid.col_a(r) or "").strip().upper() == "EXERCISE SELECTION":
            header_row = r
            break

    if header_row is None:
        # Fallback: assume table starts right after title row
        header_row = start_row + 1

    exercises: List[Dict] = []
    for r in grid.iter_rows(header_row + 1, end_row):
        a = grid.col_a(r)
        if not a:
            continue
        up = a.upper()
        if up.startswith("COOL-DOWN") or up.startswith("DEFATICAMENTO"):
            break
        if _looks_like_day_header(a):
            break

        name = a
        reps = _parse_int(grid.get(r, "C"))
        sets = _parse_int(grid.get(r, "D"))
        if not name or reps is None or sets is None:
            continue

        weight_num = _parse_number(grid.get(r, "B"))
        ex = {"name": name, "sets": sets, "reps": reps}
        if weight_num is not None:
            # Importer expects weight to be a number >= 0
            ex["weight"] = weight_num
        exercises.append(ex)

    return {
        "id": _slugify(workout_name),
        "name": workout_name,
        "type": "strength",
        "exercises": exercises,
    }


def extract_emom_workout(grid: SheetGrid, start_row: int, end_row: int, workout_name: str) -> Dict:
    duration = None
    main_header_row = None
    for r in grid.iter_rows(start_row, end_row):
        a = grid.col_a(r)
        if not a:
            continue
        m = re.search(r"EMOM\s+(\d+)\s*MIN", a, flags=re.IGNORECASE)
        if m and duration is None:
            duration = int(m.group(1))
        if "ALLENAMENTO PRINCIPALE" in a.upper():
            main_header_row = r

    warmup = _extract_warmup(grid, start_row, end_row)

    minute_a: List[Dict[str, str]] = []
    minute_b: List[Dict[str, str]] = []
    extras: List[Dict[str, str]] = []

    scan_start = (main_header_row or start_row)
    for r in grid.iter_rows(scan_start, end_row):
        a = grid.col_a(r)
        b = grid.col_b(r)
        if not a or not b:
            continue

        if re.match(r"^\s*Minuto\s*A\b", a, flags=re.IGNORECASE):
            label = _extract_after_colon_or_strip_prefix(a, r"^\s*Minuto\s*A\b.*?\)\s*")
            minute_a.append({"label": label, "target": b})
        elif re.match(r"^\s*Minuto\s*B\b", a, flags=re.IGNORECASE):
            label = _extract_after_colon_or_strip_prefix(a, r"^\s*Minuto\s*B\b.*?\)\s*")
            minute_b.append({"label": label, "target": b})
        elif re.match(r"^\s*Extra\s*:", a, flags=re.IGNORECASE):
            label = _extract_after_colon_or_strip_prefix(a, r"^\s*Extra\s*:\s*")
            extras.append({"label": label, "target": b})

    # Importer requires durationMinutes > 0 and non-empty minuteA/minuteB arrays
    return {
        "id": _slugify(workout_name),
        "name": workout_name,
        "type": "emom",
        "exercises": [],
        "durationMinutes": duration or 1,
        "warmup": warmup or None,
        "minuteA": minute_a,
        "minuteB": minute_b,
        "extras": extras or None,
    }


def extract_circuit_workout(grid: SheetGrid, start_row: int, end_row: int, workout_name: str) -> Dict:
    rounds = None
    rest_seconds = None
    main_header_row = None

    for r in grid.iter_rows(start_row, end_row):
        a = grid.col_a(r)
        if not a:
            continue
        up = a.upper()
        if "ALLENAMENTO PRINCIPALE" in up:
            main_header_row = r
            m_rounds = re.search(r"(\d+)\s*ROUND", a, flags=re.IGNORECASE)
            if m_rounds:
                rounds = int(m_rounds.group(1))
            m_rest = re.search(r"(\d+)\s*sec", a, flags=re.IGNORECASE)
            if m_rest:
                rest_seconds = int(m_rest.group(1))

    warmup = _extract_warmup(grid, start_row, end_row)

    stations: List[Dict] = []
    scan_start = (main_header_row or start_row)
    for r in grid.iter_rows(scan_start, end_row):
        a = grid.col_a(r)
        b = grid.col_b(r)
        if not a or not b:
            continue
        m = re.match(r"^\s*(\d+)\.\s*(.+)$", a)
        if not m:
            continue
        order = int(m.group(1))
        label = m.group(2).strip()
        stations.append({"order": order, "label": label, "target": b})

    return {
        "id": _slugify(workout_name),
        "name": workout_name,
        "type": "circuit",
        "exercises": [],
        "rounds": rounds or 1,
        "restBetweenRoundsSeconds": rest_seconds,
        "warmup": warmup or None,
        "stations": stations,
    }


def convert_excel_to_json(xlsx_path: Path) -> Tuple[List[Dict], Dict[str, int]]:
    templates: List[Dict] = []
    counts = {"strength": 0, "emom": 0, "circuit": 0}

    for sheet_name, sheet_xml in _load_workbook_sheets(xlsx_path):
        grid = _parse_xlsx_sheet_xml(sheet_name, sheet_xml)

        # Find all workout section start rows (day headers) in column A
        starts: List[Tuple[int, int, str]] = []
        for r in range(1, grid.max_row + 1):
            a = grid.col_a(r)
            if not a:
                continue
            parsed = _looks_like_day_header(a)
            if not parsed:
                continue
            day_num, normalized_header = parsed
            workout_name = f"{sheet_name} - {normalized_header}"
            starts.append((r, day_num, workout_name))

        # Determine section boundaries and extract each workout
        for idx, (start_row, _day_num, workout_name) in enumerate(starts):
            end_row = (starts[idx + 1][0] - 1) if idx + 1 < len(starts) else grid.max_row
            wtype = _section_type_from_name(workout_name)

            if wtype == "strength":
                tpl = extract_strength_workout(grid, start_row, end_row, workout_name)
            elif wtype == "emom":
                tpl = extract_emom_workout(grid, start_row, end_row, workout_name)
            elif wtype == "circuit":
                tpl = extract_circuit_workout(grid, start_row, end_row, workout_name)
            else:
                tpl = extract_strength_workout(grid, start_row, end_row, workout_name)

            templates.append(tpl)
            counts[wtype] = counts.get(wtype, 0) + 1

    return templates, counts


def main(argv: List[str]) -> int:
    if len(argv) < 2:
        print("Usage: python convert_workout_excel_to_json.py <workbook.xlsx> [output.json]")
        return 2

    xlsx_path = Path(argv[1])
    if not xlsx_path.exists():
        print(f"Error: file not found: {xlsx_path}")
        return 2

    out_path = Path(argv[2]) if len(argv) >= 3 else xlsx_path.with_suffix(".json")

    templates, counts = convert_excel_to_json(xlsx_path)

    # Normalize None fields away to keep JSON clean (Admin importer accepts missing optional fields)
    def strip_nones(obj):
        if isinstance(obj, list):
            return [strip_nones(x) for x in obj]
        if isinstance(obj, dict):
            return {k: strip_nones(v) for k, v in obj.items() if v is not None}
        return obj

    templates = strip_nones(templates)

    # Validate output matches Admin importer expectations (mirrors `importTemplatesFromJSON` rules)
    def fail(msg: str) -> int:
        print(f"Validation error: {msg}")
        return 1

    def is_non_empty_string(v) -> bool:
        return isinstance(v, str) and v.strip() != ""

    def validate_targeted(items, label: str, required: bool, require_non_empty: bool):
        if items is None:
            return [] if not required else None
        if not isinstance(items, list):
            return None
        if require_non_empty and len(items) == 0:
            return None
        for idx, it in enumerate(items):
            if not isinstance(it, dict):
                return None
            if not is_non_empty_string(it.get("label")):
                return None
            if not is_non_empty_string(it.get("target")):
                return None
        return items

    for i, t in enumerate(templates):
        if not isinstance(t, dict):
            return fail(f"Template {i + 1}: must be an object")
        if not is_non_empty_string(t.get("name")):
            return fail(f'Template {i + 1}: Missing or invalid "name" field')
        raw_type = t.get("type", "strength")
        if raw_type not in ("strength", "emom", "circuit"):
            return fail(f'Template {i + 1}: Invalid "type"')
        if raw_type == "strength":
            exs = t.get("exercises")
            if not isinstance(exs, list) or len(exs) == 0:
                return fail(f'Template {i + 1}: Missing or empty "exercises" array')
            for j, ex in enumerate(exs):
                if not isinstance(ex, dict):
                    return fail(f"Template {i + 1}, Exercise {j + 1}: must be an object")
                if not is_non_empty_string(ex.get("name")):
                    return fail(f'Template {i + 1}, Exercise {j + 1}: Missing or invalid "name"')
                if not isinstance(ex.get("sets"), int) or ex["sets"] < 1:
                    return fail(f'Template {i + 1}, Exercise {j + 1}: "sets" must be an int >= 1')
                if not isinstance(ex.get("reps"), int) or ex["reps"] < 1:
                    return fail(f'Template {i + 1}, Exercise {j + 1}: "reps" must be an int >= 1')
                if "weight" in ex and (not isinstance(ex["weight"], (int, float)) or ex["weight"] < 0):
                    return fail(f'Template {i + 1}, Exercise {j + 1}: "weight" must be a number >= 0')
        elif raw_type == "emom":
            if not isinstance(t.get("durationMinutes"), (int, float)) or t["durationMinutes"] <= 0:
                return fail(f'Template {i + 1}: "durationMinutes" must be a number > 0')
            if validate_targeted(t.get("warmup"), "warmup", required=False, require_non_empty=False) is None:
                return fail(f'Template {i + 1}: Invalid "warmup"')
            if validate_targeted(t.get("minuteA"), "minuteA", required=True, require_non_empty=True) is None:
                return fail(f'Template {i + 1}: Invalid or empty "minuteA"')
            if validate_targeted(t.get("minuteB"), "minuteB", required=True, require_non_empty=True) is None:
                return fail(f'Template {i + 1}: Invalid or empty "minuteB"')
            if validate_targeted(t.get("extras"), "extras", required=False, require_non_empty=False) is None:
                return fail(f'Template {i + 1}: Invalid "extras"')
            if not isinstance(t.get("exercises"), list):
                return fail(f'Template {i + 1}: "exercises" must be an array (can be empty)')
        elif raw_type == "circuit":
            if not isinstance(t.get("rounds"), int) or t["rounds"] < 1:
                return fail(f'Template {i + 1}: "rounds" must be an int >= 1')
            if "restBetweenRoundsSeconds" in t and t["restBetweenRoundsSeconds"] is not None:
                if not isinstance(t["restBetweenRoundsSeconds"], int) or t["restBetweenRoundsSeconds"] < 0:
                    return fail(f'Template {i + 1}: "restBetweenRoundsSeconds" must be an int >= 0')
            if validate_targeted(t.get("warmup"), "warmup", required=False, require_non_empty=False) is None:
                return fail(f'Template {i + 1}: Invalid "warmup"')
            sts = t.get("stations")
            if not isinstance(sts, list) or len(sts) == 0:
                return fail(f'Template {i + 1}: Missing or empty "stations" array')
            for j, st in enumerate(sts):
                if not isinstance(st, dict):
                    return fail(f"Template {i + 1}, Station {j + 1}: must be an object")
                if not isinstance(st.get("order"), int) or st["order"] < 1:
                    return fail(f'Template {i + 1}, Station {j + 1}: "order" must be an int >= 1')
                if not is_non_empty_string(st.get("label")):
                    return fail(f'Template {i + 1}, Station {j + 1}: Missing or invalid "label"')
                if not is_non_empty_string(st.get("target")):
                    return fail(f'Template {i + 1}, Station {j + 1}: Missing or invalid "target"')
            if not isinstance(t.get("exercises"), list):
                return fail(f'Template {i + 1}: "exercises" must be an array (can be empty)')

    out_path.write_text(json.dumps(templates, ensure_ascii=False, indent=2), encoding="utf-8")

    print(
        f"Converted: {counts.get('strength', 0)} strength | {counts.get('emom', 0)} emom | {counts.get('circuit', 0)} circuit"
    )
    print(f"Wrote: {out_path}")
    print(f"Admin import validation: OK ({len(templates)} templates)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))

