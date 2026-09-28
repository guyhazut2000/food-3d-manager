# Code Smell Checklist

Use this to diagnose. Every finding in the plan should name the smell and the file.

## Anywhere
- **Long file / long function** — does several unrelated things; hard to name in one sentence.
- **Duplication** — same logic or markup in 2+ places (copy-pasted blocks, repeated class strings, repeated error handling).
- **Magic values** — unexplained numbers/strings inline; give them a named constant.
- **Dead code** — unused files, exports, variables, params, dependencies, commented-out code.
- **Unclear names** — `data`, `handle`, `tmp`, abbreviations, names that no longer match behavior.
- **Comments explaining *what*** — rename or extract instead; keep only comments explaining *why*.
- **Deep nesting** — replace with early returns / guard clauses.
- **Mixed levels of abstraction** — high-level flow interleaved with low-level details in one function.

## React
- **Component does too much** — rendering + data fetching + business logic + event wiring. Extract hooks and pure helpers.
- **Components defined inside components** — remounts every render; move to module level.
- **Derived state stored in state or synced with effects** — compute during render instead.
- **Effects doing event work** — logic triggered by a user action belongs in the handler.
- **Frequently changing values in state** (per-frame positions, input) — use refs.
- **Prop drilling through 3+ levels** — consider context or restructuring.
- **Repeated Tailwind class strings** — extract a small UI component (e.g. `Button`, `Field`), not a string constant soup.
- **Loose types** — `any`, unchecked casts, stringly-typed unions that could be literal types.
- **Barrel imports / cross-feature imports of internals.**

## FastAPI / Python
- **Fat route handlers** — business logic, queries, and response shaping in one function.
- **Dependencies not using `Annotated` aliases**, or the same alias redefined in several modules.
- **`response_model` where a return type would do**; returning ORM objects without a schema.
- **Duplicated query/validation logic** across routes.
- **Config read ad hoc** (`os.getenv` scattered) instead of one settings module.
- **Blocking calls inside `async def`** (sync DB drivers, heavy CPU like password hashing in hot paths without consideration).
- **Missing or inconsistent type hints** on public functions.
- **Tests coupled to file layout** rather than behavior (fine to move; red flag if they must change assertions).
