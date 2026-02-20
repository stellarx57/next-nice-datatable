# Contributing to next-nice-datatable

Thank you for considering a contribution! Every bug report, suggestion, and pull request makes the library better for everyone.

---

## Code of Conduct

This project operates under a standard of mutual respect and professionalism. Please be kind, constructive, and inclusive in all interactions.

---

## How to contribute

### Reporting bugs

Before opening a new issue, search the existing issues to avoid duplicates. When you do open a report, please include:

- A clear, descriptive title
- The exact steps to reproduce the problem
- What you expected to happen and what actually happened
- Your environment: OS, Node version, React version, MUI version
- A minimal code example or StackBlitz/CodeSandbox link if possible

### Suggesting enhancements

Enhancement suggestions are tracked as GitHub issues. Include:

- A clear, descriptive title
- A detailed description of the proposed change
- Why it would be useful and who would benefit
- Any alternatives you considered

### Pull requests

1. Fork the repository and create a branch from `main`
2. Make focused, well-described commits (see [Commit messages](#commit-messages))
3. Update the README and CHANGELOG if your change affects behaviour or the public API
4. Run all checks before pushing (see [Development setup](#development-setup))
5. Open a pull request against `main` with a description of what changed and why

---

## Development setup

### Prerequisites

- Node.js 18 or 20+
- npm 9+

### Getting started

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/next-nice-datatable.git
cd next-nice-datatable

# Install dependencies
npm install

# Type-check without building
npm run type-check

# Build the package (CJS + ESM + .d.ts)
npm run build

# Watch mode – rebuilds on every file save
npm run dev

# Lint
npm run lint
```

### Testing your changes locally

The easiest way to test a local build inside another project is `npm link`:

```bash
# Inside this repo
npm run build
npm link

# Inside your consumer project
npm link next-nice-datatable
```

Or copy the `dist/` folder and import it directly in a local test app.

---

## Project structure

```
next-nice-datatable/
├── src/
│   ├── DataTable.tsx       Main component
│   ├── SearchDialog.tsx    Advanced-search dialog
│   ├── useDataTable.ts     State management hook
│   ├── exportUtils.ts      CSV / Excel / PDF / Word export helpers
│   ├── types.ts            All TypeScript type definitions
│   └── index.ts            Public entry point (exports)
├── dist/                   Built output (generated – not committed)
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── README.md
├── CHANGELOG.md
└── CONTRIBUTING.md
```

---

## Coding style

### TypeScript

- All new code must be TypeScript; no `.js` source files
- Avoid `any` — use `unknown` with type guards or `Record<string, unknown>` for dynamic objects
- Use interfaces for component props and exported configuration objects
- Document all public-facing types with JSDoc comments

### React

- Functional components with hooks only
- Use `useCallback` for handlers passed as props (prevents unnecessary child re-renders)
- Use `useMemo` for derived values that are expensive to compute
- Keep components focused; extract sub-components or hooks when a single component exceeds ~300 lines

### Security checklist (mandatory for export-related changes)

- Any string inserted into generated HTML (PDF, Word) **must** be passed through `escapeHtml()` unless explicitly behind the `allowUnsafeHtml` flag
- Any property lookup using a user-supplied key **must** go through `getNestedValue()` (which blocks `__proto__`, `constructor`, `prototype`)
- Do not introduce new dependencies without discussing them in an issue first — each dependency is a potential supply-chain risk

### Naming conventions

| Kind | Style | Example |
|---|---|---|
| React components | PascalCase | `DataTable`, `SearchDialog` |
| Hooks | camelCase with `use` prefix | `useDataTable` |
| Utility functions | camelCase | `getNestedValue`, `exportToPdf` |
| Constants | UPPER_SNAKE_CASE | `BANNED_KEYS`, `DEFAULT_ROWS_PER_PAGE` |
| TypeScript interfaces | PascalCase | `DataTableColumn`, `ExportConfig` |
| Files — components | PascalCase | `DataTable.tsx` |
| Files — utilities/hooks | camelCase | `exportUtils.ts`, `useDataTable.ts` |

---

## Commit messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>: <short imperative summary>

[optional body]
[optional footer]
```

| Type | When to use |
|---|---|
| `feat` | A new feature |
| `fix` | A bug fix |
| `security` | A security hardening change |
| `perf` | A performance improvement |
| `refactor` | Code change that is neither a fix nor a feature |
| `docs` | Documentation only |
| `style` | Formatting, whitespace (no logic change) |
| `test` | Adding or updating tests |
| `chore` | Maintenance — dependency bumps, build config, etc. |

Examples:

```
feat: add selectAllScope option to SelectionConfig
fix: clear debounce timer on unmount to prevent state updates after unmount
security: block __proto__ and constructor in getNestedValue
docs: document allowUnsafeHtml flag in ExportConfig
```

---

## Release process

Releases are made by maintainers.

```bash
# 1. Ensure main is clean and type-checks pass
git checkout main && git pull
npm run type-check

# 2. Bump version (automatically commits and tags)
npm version patch   # 2.0.0 → 2.0.1
# or
npm version minor   # 2.0.0 → 2.1.0
# or
npm version major   # 2.0.0 → 3.0.0

# 3. Push commit + tag
git push origin main --follow-tags

# 4. Publish to npm (prepublishOnly runs the build automatically)
npm publish --access public
```

After publishing, create a GitHub Release from the new tag at  
https://github.com/stellarx57/next-nice-datatable/releases/new

---

## Questions?

- Open a [GitHub Issue](https://github.com/stellarx57/next-nice-datatable/issues) for bugs or feature requests
- Start a [GitHub Discussion](https://github.com/stellarx57/next-nice-datatable/discussions) for questions, ideas, or general conversation

---

Thank you for contributing to next-nice-datatable!
