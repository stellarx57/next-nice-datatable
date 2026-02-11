# Contributing to Next Nice DataTable

First off, thank you for considering contributing to Next Nice DataTable! It's people like you that make this component better for everyone.

## Code of Conduct

This project and everyone participating in it is governed by respect and professionalism. Please be kind and constructive.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and what you expected**
- **Include screenshots or animated GIFs if applicable**
- **Include your environment details** (OS, Node version, React version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List any alternative solutions you've considered**

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** with clear, descriptive commits
3. **Update documentation** if you're changing functionality
4. **Follow the existing code style**
5. **Test your changes** thoroughly
6. **Submit a pull request**

## Development Setup

### Prerequisites

- Node.js 18+ or 20+
- npm or yarn

### Setup Steps

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/next_nice_datatable.git
cd next_nice_datatable

# Install dependencies
npm install

# Build the package
npm run build

# Watch mode for development
npm run dev

# Run linter
npm run lint

# Run type check
npm run type-check
```

## Project Structure

```
next_nice_datatable/
├── src/
│   ├── DataTable.tsx      # Main component
│   ├── SearchDialog.tsx   # Advanced search dialog
│   ├── useDataTable.ts    # Custom hook
│   ├── exportUtils.ts     # Export utilities
│   ├── types.ts           # TypeScript definitions
│   └── index.ts           # Main entry point
├── dist/                  # Built files (generated)
├── .github/
│   └── workflows/         # CI/CD workflows
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── README.md
```

## Coding Style

### TypeScript

- Use TypeScript for all new code
- Provide proper type definitions
- Avoid `any` types when possible
- Use interfaces for component props

### React

- Use functional components with hooks
- Follow React best practices
- Use `useCallback` and `useMemo` appropriately
- Keep components focused and composable

### Naming Conventions

- **Components**: PascalCase (e.g., `DataTable`, `SearchDialog`)
- **Files**: PascalCase for components, camelCase for utilities
- **Functions**: camelCase (e.g., `handleClick`, `formatData`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `DEFAULT_PAGE_SIZE`)
- **Interfaces**: PascalCase with descriptive names

### Comments

- Write self-documenting code when possible
- Add JSDoc comments for public APIs
- Explain complex logic with inline comments
- Keep comments up-to-date with code changes

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat: add new feature`
- `fix: fix a bug`
- `docs: documentation changes`
- `style: code style changes (formatting, etc.)`
- `refactor: code refactoring`
- `test: add or update tests`
- `chore: maintenance tasks`

Examples:
```
feat: add column resizing functionality
fix: resolve pagination issue on mobile
docs: update README with new examples
refactor: simplify export logic
```

## Testing

### Manual Testing

Before submitting a pull request:

1. Test your changes in a real React/Next.js application
2. Test on different screen sizes (mobile, tablet, desktop)
3. Test with different data sets (empty, small, large)
4. Test all affected features

### Automated Testing

We welcome contributions that add automated tests!

## Documentation

- Update README.md for user-facing changes
- Update TypeScript definitions
- Add examples for new features
- Update CHANGELOG.md

## Release Process

Releases are handled by maintainers:

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create a new tag (`v1.0.0`)
4. Push tag to trigger GitHub Actions
5. GitHub Actions publishes to npm

## Questions?

Feel free to:
- Open an issue for questions
- Start a discussion on GitHub Discussions
- Reach out to maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Next Nice DataTable! 🎉

