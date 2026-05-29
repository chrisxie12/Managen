# Cleanup Note: Duplicate `Schoolos/` Folder

## Why this matters

The repository currently contains a duplicate project tree at `Schoolos/` that mirrors the main backend/frontend structure.

Keeping both copies active creates **drift risk**:

- Fixes applied in one tree may be missed in the other.
- Tests can pass against one copy while deployments use another.
- Reviews and merges become noisy and error-prone.
- Developers may run commands from the wrong folder unintentionally.

## Current guard

The duplicate directory is ignored in Git via:

- `/Schoolos/` in `.gitignore`

This prevents accidental commits from the duplicate tree.

## Recommended cleanup sequence

1. Back up `Schoolos/` externally (zip/archive).
2. Verify no required unique files exist only in `Schoolos/`.
3. Remove `Schoolos/` from the workspace.
4. Continue development only in root project paths.

## Final goal

One canonical source tree, one test surface, one deploy surface.
