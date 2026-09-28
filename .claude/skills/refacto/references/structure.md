# Target Structure

Default layouts to move toward. Adapt to what exists — introduce a folder only when there's code to put in it.

## React (Vite + TypeScript)

Feature-based. Each feature owns its components, hooks, API calls, and types.

```
src/
├── main.tsx
├── app/                      # app shell: top-level screen/routing state, providers
│   └── App.tsx
├── features/
│   ├── auth/
│   │   ├── AuthPage.tsx
│   │   ├── authApi.ts        # feature-specific API calls
│   │   └── types.ts
│   ├── avatar/
│   │   ├── Onboarding.tsx
│   │   ├── components/       # only when a feature has several sub-components
│   │   └── ...
│   └── store/
│       ├── StoreScene.tsx
│       ├── hooks/            # e.g. useMovementKeys.ts
│       └── ...
└── shared/                   # used by 2+ features
    ├── api/client.ts         # fetch wrapper, ApiError
    ├── ui/                   # generic presentational components (Button, Field…)
    └── config.ts
```

Rules of thumb:
- A feature may import from `shared/`; features should not import each other's internals. If two features need the same thing, move it to `shared/` (or expose it from the owning feature's top-level file).
- Import files directly; avoid `index.ts` barrel files (they hurt bundling and hide dependencies).
- One exported component per file, named like the file. Small private helper components in the same file are fine when only that file uses them.
- Components render; hooks hold stateful/behavioral logic (keyboard input, data loading, animation state). Pure calculations (collision, layout math) go in plain `.ts` modules — easy to unit test.
- Constants that configure a feature (speeds, sizes, palettes) live at the top of the module or in a `constants.ts` of that feature, not inline magic numbers.

## FastAPI

Domain modules. Each domain owns its router, schemas, models, and logic; cross-cutting infrastructure lives in `core/`.

```
app/
├── main.py                   # create app, middleware, include routers — nothing else
├── core/
│   ├── config.py             # settings
│   ├── db.py                 # engine, session, Base, get_db
│   └── security.py           # hashing, tokens
├── auth/
│   ├── router.py
│   ├── schemas.py
│   ├── models.py             # User, Session
│   ├── dependencies.py       # CurrentUser, etc.
│   └── service.py            # only if routes contain non-trivial logic
└── avatar/
    ├── router.py
    ├── schemas.py
    └── models.py
tests/
├── conftest.py
├── auth/test_*.py
└── avatar/test_*.py
```

Rules of thumb:
- Routers stay thin: parse input, call logic, return a typed result. Move logic into `service.py` once a route does more than a couple of DB operations or the same logic is needed elsewhere — not before.
- Keep Alembic aware of all models (import each domain's `models.py` in `alembic/env.py` or a `models` aggregator) so autogenerate still sees every table after moving files.
- Moving models must not change table names, columns, or constraints — verify with `alembic revision --autogenerate` producing an **empty** migration (then delete it).
- Shared dependency types (`DbSession`, `CurrentUser`) are defined once and imported, never redefined.
