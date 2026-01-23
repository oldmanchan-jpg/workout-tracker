import { minimatch } from 'minimatch';
import path from 'path';

/**
 * Policy decision result
 */
export type PolicyDecision = {
  allowed: boolean;
  reason: string;
};

/**
 * Checks if a file path is allowed based on allowlist and denylist patterns.
 * Uses minimatch for glob pattern matching.
 *
 * Rules:
 * - Denylist wins always (if matches, allowed=false)
 * - If allowlist matches and not denied, allowed=true
 * - Otherwise deny-by-default
 *
 * @param filePath Repository-relative file path (e.g., "docs/file.md")
 * @param allow Array of glob patterns for allowed files
 * @param deny Array of glob patterns for denied files
 * @returns PolicyDecision with allowed flag and reason
 */
export function isFileAllowed(
  filePath: string,
  allow: string[],
  deny: string[]
): PolicyDecision {
  // Normalize path separators to forward slashes for consistent matching
  const normalizedPath = filePath.split(path.sep).join('/');

  // Check denylist first (denylist always wins)
  for (const denyPattern of deny) {
    if (minimatch(normalizedPath, denyPattern)) {
      return {
        allowed: false,
        reason: `File matches denylist pattern: ${denyPattern}`,
      };
    }
  }

  // Check allowlist
  for (const allowPattern of allow) {
    if (minimatch(normalizedPath, allowPattern)) {
      return {
        allowed: true,
        reason: `File matches allowlist pattern: ${allowPattern}`,
      };
    }
  }

  // Deny by default
  return {
    allowed: false,
    reason: 'File does not match any allowlist pattern (deny-by-default)',
  };
}

/**
 * Checks if a command is allowed based on allowlist and denylist patterns.
 *
 * Rules:
 * - Denylist: block if cmd string includes or starts with a deny pattern
 * - Allowlist: allow if cmd startsWith any allow entry
 * - Otherwise block (deny-by-default)
 *
 * @param cmd Command string to check (e.g., "git diff")
 * @param allow Array of command patterns for allowed commands
 * @param deny Array of command patterns for denied commands
 * @returns PolicyDecision with allowed flag and reason
 */
export function isCommandAllowed(
  cmd: string,
  allow: string[],
  deny: string[]
): PolicyDecision {
  // Check denylist first (denylist always wins)
  for (const denyPattern of deny) {
    if (cmd.includes(denyPattern) || cmd.startsWith(denyPattern)) {
      return {
        allowed: false,
        reason: `Command matches denylist pattern: ${denyPattern}`,
      };
    }
  }

  // Check allowlist
  for (const allowPattern of allow) {
    if (cmd.startsWith(allowPattern)) {
      return {
        allowed: true,
        reason: `Command matches allowlist pattern: ${allowPattern}`,
      };
    }
  }

  // Deny by default
  return {
    allowed: false,
    reason: 'Command does not match any allowlist pattern (deny-by-default)',
  };
}
