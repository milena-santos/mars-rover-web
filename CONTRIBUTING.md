# Contributing

## Branches

`main` and `develop` are permanent and protected branches:

- `main` contains production-ready code (Vercel production).
- `develop` contains changes approved for staging (Vercel preview).

Create short-lived branches from `develop`:

```text
feature/short-description
fix/short-description
chore/short-description
docs/short-description
refactor/short-description
test/short-description
```

Create `hotfix/short-description` from `main` only for urgent production
corrections. A merged hotfix must also be synchronized back into `develop`.

Use lowercase kebab-case and describe the intended outcome. Do not include
personal names in branch names.

## Commits

Commit messages follow the
[Conventional Commits](https://www.conventionalcommits.org/) specification:

```text
<type>(optional-scope): <description>
```

Examples:

```text
feat(scene): add intro landing sequence
fix(dock): keep mission hud during probe landing
chore(ci): add quality checks
docs(readme): document vercel environments
```

Keep commits focused and do not mix unrelated changes.

## Pull requests

1. Push the short-lived branch.
2. Open a pull request targeting `develop`.
3. Complete the pull request template.
4. Keep the branch updated and resolve every review conversation.
5. Merge only after all required checks and approvals pass.

Feature work is squash-merged into `develop`. A push to `develop` opens or
updates the release pull request into `main` automatically. Releases from
`develop` to `main` use a merge commit so the histories of the permanent
branches remain related.

## Quality

Formatting, linting, type checking, and production build must pass before
merge:

```bash
npm ci
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

These checks run on GitHub Actions for pull requests and pushes to `develop`
and `main`.
