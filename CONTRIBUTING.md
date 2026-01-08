# Contributing to SQLite Visualizer

Thank you for your interest in contributing to SQLite Visualizer! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/sqlite-visualizer.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/your-feature-name`

## Development Workflow

### Building the Library

```bash
npm run build
```

### Running Tests

```bash
npm test
```

### Running the Demo

```bash
cd demo
npm install
npm run dev
```

### Code Style

We use ESLint and Prettier for code formatting:

```bash
npm run lint
npm run format
```

## Making Changes

1. Make your changes in the `src/` directory
2. Add tests for new features
3. Update documentation if needed
4. Ensure all tests pass
5. Run the linter and formatter

## Submitting Changes

1. Commit your changes: `git commit -m "Add amazing feature"`
2. Push to your fork: `git push origin feature/your-feature-name`
3. Open a Pull Request on GitHub

## Code Guidelines

- Use TypeScript for all new code
- Follow the existing code style
- Write meaningful commit messages
- Add JSDoc comments for public APIs
- Keep components focused and reusable

## Questions?

Feel free to open an issue for any questions or concerns.

