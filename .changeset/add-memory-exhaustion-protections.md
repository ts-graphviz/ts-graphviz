---
"@ts-graphviz/ast": patch
---

Add memory exhaustion protection with input size and AST node count limits

Addresses security vulnerability where extremely large inputs or inputs with excessive elements could cause memory exhaustion, leading to application crashes and potential DoS attacks.

## Security Enhancements

### Input Size Limit
- Added `maxInputSize` option to `parse()` function (default: 10MB)
- Validates input size before parsing to prevent memory exhaustion from extremely large DOT files
- Configurable limit allows flexibility for legitimate large graphs
- Can be disabled by setting to 0 (not recommended for untrusted inputs)

### AST Node Count Limit
- Added `maxASTNodes` option to `parse()` function (default: 100,000 nodes)
- Tracks and limits the number of AST nodes created during parsing
- Prevents memory exhaustion from inputs with excessive elements
- Configurable limit for complex graphs when needed
- Can be disabled by setting to 0 (not recommended for untrusted inputs)

## Changes

### API Updates
- `CommonParseOptions` interface extended with `maxInputSize` and `maxASTNodes` options
- `Builder` class enhanced with node counting and validation
- `parse()` function validates input size before parsing
- Parser grammar updated to pass limits to Builder

### Error Handling
- Input size violations throw `DotSyntaxError` with descriptive messages
- AST node count violations throw `DotSyntaxError` with actionable guidance
- Error messages include current values and suggestions for resolution

### Testing
- Comprehensive test coverage for both limits
- Tests for normal usage, boundary conditions, and limit violations
- Tests for custom limit values and disabling limits
- All 62 parser tests passing

### Documentation
- Updated `SECURITY.md` with detailed security protection information
- Added usage examples and best practices
- Documented recommendations for untrusted input handling

## Security Impact

- Prevents DoS attacks via extremely large DOT files (hundreds of MB)
- Prevents memory exhaustion from inputs with tens of thousands of elements
- Default limits protect normal use cases while allowing customization
- Complements existing protections (HTML nesting depth, edge chain depth)
- Provides defense-in-depth security strategy
