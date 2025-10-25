---
"@ts-graphviz/react": patch
---

Security enhancement: Add stack overflow protection to `renderHTMLLike` function

This patch addresses a security vulnerability where deeply nested or circular React element structures could cause stack overflow, leading to application crashes and potential DoS attacks.

**Changes:**
- Added maximum recursion depth limit (default: 1000 levels) to prevent stack overflow attacks
- Implemented circular reference detection to prevent infinite loops
- Introduced `RenderHTMLLikeOptions` interface with configurable `maxDepth` option
- Enhanced error handling with descriptive error messages and console warnings

**Security Impact:**
- Prevents stack overflow from deeply nested React element structures
- Prevents infinite loops from circular element references
- Normal use cases are unaffected by the default 1000-level depth limit
- Configurable limit allows complex rendering when needed

**Usage:**
```ts
// Default behavior (max depth: 1000)
renderHTMLLike(<div><span>Hello</span></div>);

// Custom max depth for complex structures
renderHTMLLike(<div>...</div>, { maxDepth: 5000 });

// Stricter validation for user-generated content
renderHTMLLike(userElement, { maxDepth: 100 });
```
