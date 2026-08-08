# Required branch protection

The CI/CD workflow reports results, but a GitHub repository rule is required to
prevent pull requests with failing CI from being merged.

Create a branch ruleset for `main` with these settings:

1. Require a pull request before merging.
2. Require status checks to pass before merging.
3. Select `CI Success` as the required status check.
4. Require branches to be up to date before merging (recommended).
5. Disable bypass permissions if administrators must follow the same rule.

The workflow runs CI for pull requests and pushes to `main`. Deployment runs
only after successful CI on a push to `main`, and frontend/backend jobs and
deployment steps run only for the application areas that changed.

The current deployment commands are placeholders. Replace the `echo` commands
with the hosting provider's deployment commands and configure the required
repository secrets without changing the existing job conditions.
