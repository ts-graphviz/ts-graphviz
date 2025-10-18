---
"@ts-graphviz/adapter": patch
"@ts-graphviz/ast": patch
"@ts-graphviz/common": patch
"@ts-graphviz/core": patch
"@ts-graphviz/react": patch
"ts-graphviz": patch
---

Migrate npm publishing to OIDC trusted publishing

This change migrates the npm publishing workflow from using long-lived NPM_TOKEN secrets to OIDC (OpenID Connect) trusted publishing, following GitHub's security recommendations announced in September 2025.

**Benefits:**
- Enhanced security: No more long-lived tokens to manage, rotate, or accidentally expose
- Automatic provenance: Provenance attestations are generated automatically without the --provenance flag
- Compliance: Aligns with npm's new authentication requirements (token expiration limits)
- Short-lived credentials: Each publish uses workflow-specific, ephemeral credentials

**Changes:**
- Added `environment: npm` to the release job to match trusted publisher configuration
- Upgraded npm CLI to latest version (≥11.5.1) for OIDC support
- Removed NPM_TOKEN from changesets action and snapshot publish steps
- Removed manual .npmrc creation as authentication now uses OIDC tokens
- Updated id-token permission comment to reflect OIDC usage

**Requirements:**
- npm CLI v11.5.1 or later (automatically installed in workflow)
- Trusted publisher configured for each package on npmjs.com
- GitHub Actions environment named "npm" configured for the repository
