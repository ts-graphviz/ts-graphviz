---
"@ts-graphviz/adapter": patch
"@ts-graphviz/ast": patch
"@ts-graphviz/common": patch
"@ts-graphviz/core": patch
"@ts-graphviz/react": patch
"ts-graphviz": patch
---

Fix @next tag publishing by switching back to main branch after changesets action

This change fixes an issue introduced in PR #1513 where @next snapshot versions stopped being published entirely.

**Root Cause:**
PR #1513 added a branch check to prevent stable versions from being published with the @next tag. However, the changesets action switches to the `changeset-release/main` branch and never switches back to main. This caused the branch check to always fail, preventing ALL @next publishes from running.

**Solution:**
Added a step to switch back to the main branch after the changesets action completes and before the branch check runs. This ensures:

1. The branch check passes (current branch is main)
2. The @next publish step runs as intended
3. The working directory is in the correct state (pre-version-bump) for snapshot versioning
4. No risk of publishing stable versions with @next tag (they're not in the working directory)

**Changes:**
- Added `git checkout main` step between changesets action and branch check
- This allows @next publishing to work correctly while preserving the safety check from PR #1513
