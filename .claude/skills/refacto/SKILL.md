---
name: refacto
description: Refactor code to be clean, modular, and idiomatic without changing behavior — restructure folders, split large files and components, remove duplication and verbosity, and apply React and FastAPI best practices. Use this skill whenever the user types /refacto, asks to refactor, clean up, restructure, reorganize, simplify, "make modular", reduce verbosity, apply clean code, or review code structure/quality — for the whole project, a folder, a file, or recent changes — even if they don't say "refactor".
---

# Refacto

Make the code easier to read, change, and extend — while it keeps doing exactly what it did before. A refactor that changes behavior is a bug, not a refactor.

## Companion skills

This skill decides *what* to restructure and *how to do it safely*. For framework rules, consult the installed best-practice skills and read their relevant parts before editing that side of the codebase:

- **React / frontend** → `vercel-react-best-practices` (`.claude/skills/vercel-react-best-practices/`). This project is a client-side Vite SPA, so the `rerender-`, `rendering-`, `client-`, `js-`, `advanced-`, and `bundle-barrel-imports` rules apply; skip the Next.js/server-only rules (`server-*`, `async-api-routes`, `rendering-hydration-*`, `next/dynamic` specifics).
- **FastAPI / backend** → `fastapi` (`.claude/skills/fastapi/`). Apply its conventions (`Annotated` dependencies with type aliases, return types over `response_model`, router-level prefix/tags/dependencies, one operation per function, no `...` defaults).

Where a companion skill recommends swapping a library or architecture the project deliberately chose (e.g. SQLModel instead of SQLAlchemy, sync instead of async), **don't apply it** — mention it as a suggestion in the report. Those are architecture decisions for the user, not refactors.

## Workflow

### 1. Scope
Refactor what the user asked for: the whole repo, a path, a feature, or the current diff. If unspecified, default to the whole project but plan it as separate frontend and backend passes.

### 2. Establish a green baseline
Find and run the project's checks before changing anything — tests, type check, lint, build (look in `package.json` scripts, `pytest` config, `docker-compose.yml`, CI files). If something already fails, stop and tell the user: you can't prove a refactor is safe on a red baseline.

### 3. Survey and diagnose
Read the code in scope and list concrete findings, each tied to a file, using the smells in `references/checklist.md` (read it now). Compare the current layout with the target structure in `references/structure.md`.

### 4. Propose a plan — and wait
Present a short, prioritized plan before editing:
- the target folder structure (tree), if it changes,
- each change with its reason (the smell it removes or the rule it applies),
- anything you're deliberately *not* changing, and suggestions that need the user's decision.

Wait for approval unless the change is small (roughly ≤ 3 files, no moves). Large moves are cheap to discuss and expensive to undo.

### 5. Refactor in small, verified steps
- One kind of change per step (e.g. "move files into feature folders", then "extract `useMovementKeys` hook", then "split `ShopperModel`").
- After each step, rerun the checks. If something breaks, fix it before moving on — never stack changes on a broken step.
- Moving files: update every import; search for leftover references to old paths afterward.
- Preserve public contracts: API routes, request/response shapes, DB schema, env var names, cookie names. If one genuinely must change, that's a behavior change — ask first.
- Keep tests passing unchanged where possible. Moving a test alongside code is fine; weakening an assertion to make it pass is not.

### 6. Report
Summarize: what changed and why, the new structure, check results (before and after), and suggestions that were out of scope or need a decision.

## Principles

Clean code here means code a new teammate can navigate in minutes:

- **Organize by feature, not by file type.** Everything for "auth" lives together; shared code lives in a clearly named shared place. This is what makes code modular — you can change a feature without touching the others.
- **Small units with one job.** A component, hook, or function should be describable in one sentence without "and". Split when it isn't — but don't split a 20-line thing into five 4-line files.
- **Names carry intent.** Prefer a well-named function or constant over a comment explaining a block. Delete comments that restate the code.
- **Less code, not clever code.** Remove duplication, dead code, unused exports, and needless wrappers. Don't replace clear code with dense one-liners — verbosity and cleverness are both costs.
- **No speculative abstraction.** Extract a shared helper when the second or third real use exists, not for an imagined future one. Don't add layers (services, repositories, generic base classes) that only forward calls.
- **Match the surrounding style** — formatting, naming conventions, comment density — so the refactored code doesn't stand out.
