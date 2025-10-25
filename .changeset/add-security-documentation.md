---
"@ts-graphviz/adapter": patch
---

Add comprehensive security documentation for safe usage of adapter options

This patch adds security considerations and best practices documentation to clarify the safe usage of `dotCommand`, `library`, and user-provided DOT files.

**Changes:**
- Added security considerations section to README explaining spawn/Deno.Command behavior
- Added JSDoc security notes to `dotCommand` and `library` type definitions
- Included validation example showing how to sanitize user-uploaded DOT files using @ts-graphviz/ast
- Documented potentially dangerous attributes that can access file system resources

**Documentation Clarifications:**
- Explains that spawn/Deno.Command do not invoke shell interpreters, preventing shell injection
- Clarifies that configuration options should be controlled by developers, not end-users
- Provides working TypeScript example for validating and sanitizing untrusted DOT content
- Lists file-access attributes (image, shapefile, fontpath, etc.) that require validation

This documentation addresses security concerns while maintaining that the library itself has no vulnerabilities when used as designed.
