---
"@ts-graphviz/ast": patch
"ts-graphviz": patch
---

Add null byte sanitization and comprehensive security tests for DOT injection prevention

## Security Fix

### Null Byte Handling
Added null byte removal to the `escape()` function to prevent Graphviz parsing errors. Graphviz treats null bytes (`\0`) as string terminators, causing syntax errors when encountered in quoted strings. This is now consistent with the `escapeComment()` function which already strips null bytes.

**Why this matters:**
- Prevents "syntax error in line X scanning a quoted string" errors in Graphviz
- Removes potential attack vector for causing parser failures
- Aligns with existing comment sanitization behavior

## Test Coverage Additions

### Unit Tests (escape.test.ts)
Added 16 new test cases covering various DOT injection attack vectors:
- Semicolon-based statement injection
- Edge operator injection attempts
- Graph termination injection via quotes and newlines
- Closing brace injection
- Attribute injection with equals sign
- Multiple quote injection attempts
- Mixed newlines and quotes
- Subgraph injection attempts
- Edge chain injection
- HTML-like label injection with quotes
- Port injection
- Already-escaped string handling
- Null byte removal (2 tests)
- Unicode strings with quotes
- Strict keyword injection

### Integration Tests (to-dot.test.ts)
Added 10 new end-to-end test cases:
- Statement injection in node IDs (semicolon)
- Edge operator injection in node IDs
- Graph termination injection via quotes and newlines
- Statement injection in subgraph IDs
- Attribute value injection prevention
- Edge ID injection prevention
- Multiple quotes in node ID
- Port specification injection
- Graph comment injection
- Node comment injection

## Validation

All tests confirm that the existing escape implementation correctly prevents DOT language injection by:
- Escaping double quotes (`"` → `\"`)
- Escaping newlines (`\n` → `\n`)
- Escaping carriage returns (`\r` → `\r`)
- Ensuring malicious strings are treated as literal identifiers, not DOT syntax

Verified with actual Graphviz parser (version 13.1.1) that escaped output renders safely without executing injected DOT code.
