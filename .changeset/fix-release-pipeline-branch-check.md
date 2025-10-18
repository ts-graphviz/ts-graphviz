---
"@ts-graphviz/adapter": patch
"@ts-graphviz/ast": patch
"@ts-graphviz/common": patch
"@ts-graphviz/core": patch
"@ts-graphviz/react": patch
"ts-graphviz": patch
---

Fix @next tag publishing pipeline to prevent incorrect releases

This fix addresses issues with the @next tag publishing workflow where stable versions were incorrectly published with @next tag, and subsequently, @next versions stopped being published entirely.

**Problem 1 (PR #1513):**
Stable package versions were being incorrectly published with the @next tag instead of the latest tag. The Changesets action switches to `changeset-release/main` and updates package.json versions, but the @next publish step would run on this branch where no unreleased changesets remain, causing stable versions to be published with @next tag.

**Solution 1:**
Added a branch check step to verify the current working directory is on the main branch before executing @next publish.

**Problem 2 (This PR):**
The branch check from PR #1513 prevented ALL @next publishes because the changesets action never switches back to main, causing the branch check to always fail.

**Solution 2:**
Added a step to switch back to the main branch after the changesets action completes. This ensures the working directory is in the correct state for snapshot versioning while maintaining the safety check.

**Changes:**
- Added branch check to verify current branch before @next publish
- Added `git checkout main` step after changesets action
- Updated @next publish condition to include branch verification
- Removed redundant commit message check that was ineffective
