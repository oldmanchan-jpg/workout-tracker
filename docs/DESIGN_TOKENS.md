# Design Tokens - Single Source of Truth

## Canonical Location
**`src/styles/theme.css`** is the ONLY place where design tokens are defined.

## Token Categories

### Colors
- **Backgrounds**: `--bg`, `--bg-elevated`, `--bg-surface`, `--bg-hover`
- **Text**: `--text`, `--text-secondary`, `--text-muted`, `--text-accent`
- **Accents**: `--accent`, `--accent-hover`, `--accent-success`, `--accent-warning`, `--accent-danger`
- **Borders**: `--border`, `--border-subtle`, `--border-strong`, `--border-focus`
- **Glow**: `--glow`, `--glow-soft`, `--glow-strong`

### Spacing
- Scale: `--space-1` (4px) through `--space-12` (48px)

### Typography
- Sizes: `--text-xs` (12px) through `--text-4xl` (36px)
- Weights: `--font-normal` (400) through `--font-bold` (700)

### Border Radius
- `--radius-sm` (8px) through `--radius-full` (9999px)

### Shadows
- `--shadow-sm` through `--shadow-glow`

### Transitions
- `--transition`, `--transition-fast`, `--transition-slow`

### Z-Index
- `--z-base` through `--z-tooltip`

## Usage Pattern

### In Components
```css
.my-component {
  background: var(--bg-elevated);
  color: var(--text);
  padding: var(--space-4);
  border-radius: var(--radius);
  border: 1px solid var(--border-subtle);
}
```

### In Tailwind Classes
Use the `hp` color prefix:
```tsx
<div className="bg-hp-bg-elevated text-hp-text border-hp-border-subtle" />
```

## Migration Notes

- ❌ **Don't** define new tokens in `index.css` or component files
- ✅ **Do** use tokens from `theme.css` only
- ✅ **Do** add new tokens to `theme.css` if needed
- ✅ **Do** update Tailwind config if adding new token categories
