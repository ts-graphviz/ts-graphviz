# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ts-graphviz** is a comprehensive TypeScript library for creating, manipulating, and rendering Graphviz DOT language graphs. It's a monorepo with multiple packages offering different levels of abstraction and functionality for working with graph visualizations.

## Key Commands

### Development Setup
```bash
# Install dependencies
pnpm install

# Generate code from DOT language grammar (MUST run before development)
pnpm codegen

# Build all packages
pnpm build
```

### Testing
```bash
# Run all tests
pnpm test

# Run tests with filter
pnpm test [filter-glob]

# Run E2E tests specifically
pnpm test:e2e
```

### Code Quality
```bash
# Lint and auto-fix (uses Biome)
pnpm lint

# Type checking
pnpm typecheck
```

### Package Management
```bash
# Create a changeset for versioning
pnpm changeset
```

## Architecture

This is a **pnpm workspace monorepo** with the following package structure:

### Core Packages
- **`packages/ts-graphviz`** - Main entry point, high-level API for most users
- **`packages/@ts-graphviz/core`** - Object models for graph manipulation (classes like Graph, Node, Edge)
- **`packages/@ts-graphviz/ast`** - Parser and AST handling for DOT language
- **`packages/@ts-graphviz/adapter`** - Platform-specific implementations (Node.js, Deno, Browser)
- **`packages/@ts-graphviz/common`** - Shared types and utilities
- **`packages/@ts-graphviz/react`** - React components for declarative graph creation

### Data Flow
1. **Creation**: Object-oriented API, React components, or DOT string parsing
2. **Processing**: Models → AST → DOT strings
3. **Rendering**: Platform adapters convert DOT to visual outputs

## Development Guidelines

### Code Style
- Uses **Biome** for formatting and linting
- 2-space indentation, single quotes for JS/TS
- Pre-commit hooks automatically format staged files via lefthook

### Testing Conventions
- Test files use `.test.ts` or `.spec.ts` patterns
- Uses **Vitest** as test runner
- Coverage enabled for `packages/**/src/**/*.ts`
- Test timeout disabled (set to 0)

### Package Development
- Each package has its own `package.json`, `tsconfig.json`, and build config
- Uses **Vite** for building packages
- TypeDoc for API documentation generation

### Before Contributing
1. Run `pnpm codegen` to generate required code from grammar
2. Ensure all tests pass with `pnpm test`
3. Use `pnpm changeset` to document changes for version management
4. Follow the existing code patterns in each package

### Important Notes
- The `pnpm codegen` step is crucial - it generates parser code from Graphviz DOT grammar
- AST package includes generated files that should not be manually edited
- Cross-platform support requires testing adapters for Node.js, Deno, and Browser environments
- React package provides JSX-based declarative API for graph creation