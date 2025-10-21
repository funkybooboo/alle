# Git branch workflow
> Very much still up for debate, maybe this is overkill for our purposes

- **stable/<date>**: Branch created off **main** for each user-validated, battle-tested release, named by release date (e.g., `stable/2025-10-21`). These branches act as safe rollback points if major issues occur on **main**. They are stable and may receive urgent fixes or patches.

- **main**: The production branch reflecting code deployed live. It contains code that has passed automated testing but is not yet fully battle-tested by users. All deployments come from here, and it mirrors the exact production state.

- **test**: Branch off **main** used for pre-production user testing and QA. It receives merges from **dev** once the combined features and fixes are believed ready for broader validation.

- **dev**: Branch off **test** acting as a staging ground for active development integration. This branch is not stable since it may have multiple incomplete or experimental PRs merged here. Developers create topic branches (feature, fix, refactor) off **dev**. Code here is continuously changing and prepares for testing in **test**.

- **feature/**, **fix/**, **refactor/**: Topic branches created off **dev** for isolated, focused work on new features, bug fixes, or code refactoring. They are merged back into **dev** when ready for combined integration.

- **hotfix/**: Branches created as needed from **main**, **test**, or **dev** to quickly address critical bugs. Fixes are merged back into all relevant branches to maintain synchronization.
