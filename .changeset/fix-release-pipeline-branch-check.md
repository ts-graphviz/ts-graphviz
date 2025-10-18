---
"@ts-graphviz/adapter": patch
"@ts-graphviz/ast": patch
"@ts-graphviz/common": patch
"@ts-graphviz/core": patch
"@ts-graphviz/react": patch
"ts-graphviz": patch
---

Fix release pipeline to prevent publishing stable versions with @next tag

This fix addresses a critical issue where stable package versions were being incorrectly published with the @next tag instead of the latest tag.

**Root Cause:**
The Changesets action switches to the `changeset-release/main` branch to update package.json versions and create the Version Packages PR. However, it does not switch back to the main branch afterward. As a result, the subsequent @next publish step runs on the `changeset-release/main` branch, where package.json already contains the new version (e.g., 3.0.3). Since there are no unreleased changesets remaining, `changeset version --snapshot next` does not append the `-next.xxx` suffix, and the stable version is published with the @next tag.

**Solution:**
Added a branch check step that verifies the current working directory is on the main branch before executing the @next publish step. This prevents the @next publish from running on the `changeset-release/main` branch.

**Changes:**
- Added a new step to check the current Git branch
- Updated the @next publish condition to include `steps.branch_check.outputs.current_branch == 'main'`
- Removed the redundant `!contains(github.event.head_commit.message, 'Version Packages')` condition as it was ineffective
