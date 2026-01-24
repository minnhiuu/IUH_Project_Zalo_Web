# 🌳 Git Workflow & Commit Rules (Frontend)

This document defines the official Git workflow for the Frontend Web repository.

- Team size: ~5 developers
- Issue tracking: Jira
- Jira key format: `[BH-KEY]`

---

## 1. Branch Strategy

This project uses three long-lived branches:

### `main`

- Stable release branch
- Always production-ready
- ❌ Direct push is NOT allowed

### `staging`

- Pre-release validation branch
- Receives code from `develop`
- ❌ Direct push is NOT allowed

### `develop`

- Main integration branch
- All feature and bug-fix branches must merge here first
- ❌ Direct push is NOT allowed

---

## 2. Feature / Fix Branches

### Branch naming format

```text
<type>/<BH-KEY>-short-description
```

**Examples:**

- `feat/BH-123-google-login`
- `fix/BH-256-message-duplication`

**Rules:**

- Branches MUST be created from `develop`
- One branch = one Jira task

---

## 3. Commit Message Rules (MANDATORY)

### Commit format

```text
<type>(<scope>): [BH-KEY] short description
```

**Valid examples:**

- `feat(auth): [BH-123] add google login`
- `fix(chat): [BH-256] fix duplicated messages`

**Invalid examples:**

- `fix bug`
- `add feature`
- `[BH-123]`

**Commits without a Jira key will be rejected.**

---

## 4. Pre-commit Checks (MANDATORY)

To maintain code quality and consistency, developers MUST run the following commands before every commit:

1. **Format Code:**
   ```bash
   npm run prettier:fix
   ```
2. **Lint Code:**
   ```bash
   npm run lint
   ```

**❌ Commits with linting errors or unformatted code will be rejected during Code Review.**

---

## 5. Commit Types

| Type       | Description                      |
| :--------- | :------------------------------- |
| `feat`     | New feature                      |
| `fix`      | Bug fix                          |
| `refactor` | Refactor without behavior change |
| `chore`    | Tooling / configuration          |
| `docs`     | Documentation                    |
| `style`    | Formatting / linting             |
| `perf`     | Performance improvement          |

---

## 6. Daily Development Flow

1. **Jira Task:** Pick and move to "In Progress".
2. **Create branch:** From `develop`.
3. **Coding:** Implement your changes.
4. **Pre-commit Check:** Run `npm run format` and `npm run lint`.
5. **Commit:** Follow the mandatory format.
6. **Push & PR:** Create PR targeting `develop`.
7. **Merge:** → `staging` → `main`.

---

## 7. Pull Request Rules

- All changes MUST go through Pull Request
- PR target branch: `develop`
- PR title MUST contain `[BH-KEY]`
- PR description MUST follow the provided template

---

## 8. Definition of Done (Simplified)

A Frontend task is considered DONE when:

- Code is merged into `develop`
- Commit messages follow the required format
- A Pull Request exists
- At least one reviewer has approved the PR
- Manual testing steps are provided
- All review comments are resolved

---

## 9. Forbidden Actions

- ❌ Direct push to `main`, `staging`, or `develop`
- ❌ Commits without Jira key
- ❌ Merging PRs without review approval
