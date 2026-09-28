# PRD: food-3d-manager — 3D Gamified Supermarket

| Field | Value |
|---|---|
| **Status** | Draft |
| **Version** | 0.1.0 |
| **Owner** | Guy |
| **Last Updated** | 2026-09-28 |
| **Target Release** | No fixed deadline — phased (see §5) |

---

## 1. Executive Summary

**Problem Statement**
Tracking grocery spending is tedious: receipts get lost, spreadsheets get abandoned after a few weeks, and existing budgeting apps treat groceries as one opaque line item. There is no enjoyable way to see *what* you buy, *what it costs*, and *how that changes over time*.

**Proposed Solution**
A browser-based 3D supermarket where each user walks the aisles as an avatar, adds products to a personal cart, and records real prices paid. Every checkout becomes a tracked shopping trip that feeds a spending dashboard and budget. Game mechanics (budget challenges, streaks, badges) make logging a habit instead of a chore, and a shared multiplayer store lets other users shop alongside you in real time.

**Success Criteria**
| # | KPI | Target |
|---|---|---|
| 1 | Consistent use — owner logs real grocery trips | ≥ 80% of real-world trips logged over 8 consecutive weeks |
| 2 | Spending visibility | Monthly spend, per-category breakdown, and budget-vs-actual visible in ≤ 2 clicks from the store |
| 3 | Real-time responsiveness | Avatar position updates delivered to other clients at p95 < 150 ms on a normal broadband connection |
| 4 | Stability under concurrency | 50 concurrent users in one store for 30 minutes with 0 server crashes and < 0.1% failed requests |
| 5 | Smooth 3D experience | ≥ 50 FPS on a mid-range laptop (integrated GPU, 1080p); initial store load < 5 s |

---

## 2. User Experience & Functionality

### User Personas

**P1 — The Owner / Budget-Conscious Shopper (primary, MVP)**
Buys groceries weekly, wants to know where the money goes and to spend less, but won't stick with a spreadsheet. Motivated by progress, visuals, and small wins.

**P2 — The Social Shopper (secondary, multiplayer phase)**
A friend or family member invited into the store. Wants to see others shopping, compare habits, and join shared challenges — without exposing their own spending details.

### User Stories & Acceptance Criteria

#### Epic A — Account & Identity

**A1.** As a shopper, I want to sign up and log in so that my cart and spending history are mine alone.
- AC: Sign up with email + password; passwords hashed (argon2/bcrypt), never logged.
- AC: Login issues a session token (JWT or secure cookie) valid for 7 days, refreshable.
- AC: Unauthenticated users cannot reach the store, cart, or dashboard (redirect to login).
- AC: Each user has a display name and avatar color shown to others.

#### Epic B — 3D Store

**B1.** As a shopper, I want to walk around a 3D supermarket so that shopping feels like a game.
- AC: WASD/arrow-key movement and mouse look on desktop; collision with shelves and walls.
- AC: Store has at least 6 labeled aisles mapped to product categories (e.g. Produce, Dairy, Bakery, Meat, Pantry, Household).
- AC: Meets KPI 5 (≥ 50 FPS, load < 5 s).

**B2.** As a shopper, I want to click a product on a shelf to see its details so that I can decide whether to buy it.
- AC: Clicking/approaching a product opens a panel: name, category, unit, last price I paid, average price I paid.
- AC: Panel closes with Esc or clicking outside; movement is paused while the panel is open.

#### Epic C — Cart & Checkout

**C1.** As a shopper, I want to add and remove products from my personal cart so that I can build my shopping list.
- AC: Add with quantity (default 1); change quantity or remove from a cart HUD.
- AC: Cart HUD always shows item count and running total.
- AC: Cart persists across page reloads and devices (server-side).

**C2.** As a shopper, I want to enter the actual price I paid for each item so that my records reflect reality.
- AC: Price field defaults to my last price for that product (or catalog default if none).
- AC: Price edits are stored per trip; changing a price never rewrites past trips.

**C3.** As a shopper, I want to check out so that the cart becomes a saved shopping trip.
- AC: Checkout saves a trip with date (editable, default today), store name (optional), line items, and total.
- AC: Cart is emptied after a successful checkout.
- AC: Trips can be viewed, edited, and deleted from history.

**C4.** As a shopper, I want to add products that aren't in the catalog so that I can log everything I actually buy.
- AC: Create a custom product (name, category, unit, price); it appears on the matching aisle for me only.

#### Epic D — Spending Management

**D1.** As a shopper, I want to set a monthly grocery budget so that I know when I'm overspending.
- AC: One monthly budget amount; cart HUD shows remaining budget and turns amber at 80%, red at 100%.

**D2.** As a shopper, I want a spending dashboard so that I understand where my money goes.
- AC: Shows current month total vs budget, spend per category (chart), last 6 months trend (chart), and top 10 most expensive items.
- AC: Reachable in ≤ 2 clicks from the store (KPI 2).

**D3.** As a shopper, I want to see price history per product so that I notice when things get more expensive.
- AC: Product panel links to a price-over-time chart built from my trips.

#### Epic E — Gamification

**E1.** As a shopper, I want challenges and rewards so that logging my spending stays fun.
- AC: Weekly challenge "Stay under budget" with a visible progress bar.
- AC: Logging streak (consecutive weeks with ≥ 1 trip) shown on the HUD.
- AC: At least 5 badges at launch (e.g. First Trip, 4-Week Streak, Under Budget Month, 100 Items Logged, Price Hunter — bought an item below its average price).
- AC: Badge unlocks show a short, non-blocking animation.

#### Epic F — Multiplayer

**F1.** As a shopper, I want to see other shoppers in the store in real time so that it feels alive.
- AC: Other users appear as avatars with display names; movement is interpolated smoothly.
- AC: Position updates meet KPI 3 (p95 < 150 ms).
- AC: A user who disconnects disappears within 10 s; reconnect restores their cart without data loss.

**F2.** As a shopper, I want my cart and spending to stay private so that I can play with others without sharing my finances.
- AC: Other users see only display name, avatar, and position. Cart contents, prices, budgets, and history are never sent to other clients.
- AC: Opt-in only: a user may choose to share badges/streak on their public profile.

**F3.** As a shopper, I want to chat with others in the store so that we can shop together.
- AC: Simple text chat per store; messages ≤ 280 characters; rate limit 1 message/second per user.

### Non-Goals
- **No real purchasing, payments, or delivery.** This tracks spending; it does not sell groceries.
- **No automatic price data** (scraping, retailer APIs, receipt OCR) in this PRD — deferred to a future "price intelligence" PRD.
- **No mobile/touch controls** in MVP; desktop browsers (Chrome, Firefox, Edge — latest 2 versions) only.
- **No shared/household carts** or split bills.
- **No monetization, subscriptions, or ads.**
- **No custom avatar modeling**; avatars are simple colored models.
- **No voice chat.**

---

## 3. AI System Requirements

N/A — no AI features in this scope. Candidate future uses (receipt OCR, spending insights, product categorization) will get their own PRD with evaluation criteria.

---

## 4. Technical Specifications

### Architecture Overview

```
Browser (React + TypeScript + Three.js)
   │  REST (HTTPS)            │  WebSocket (WSS)
   ▼                          ▼
FastAPI app ──────────────────────────────┐
 ├─ Shopping domain (users, catalog,      │
 │   carts, trips, budgets, badges)       │
 └─ Realtime layer (presence, position,   │
     chat — in-memory / Redis)            │
   │                          │           │
   ▼                          ▼           │
PostgreSQL (persistent)    Redis (ephemeral presence, pub/sub)
```

- **Two separate layers.** Persistent shopping data (REST + PostgreSQL) is fully separate from ephemeral real-time state (WebSocket + Redis). The realtime layer never reads or writes cart/spending tables, which enforces F2's privacy guarantee by design.
- **Position sync.** Clients send position/rotation at 10–15 Hz; the server broadcasts per store at a fixed tick (10 Hz). Clients interpolate between snapshots. The server validates movement bounds (no teleporting through walls).
- **Horizontal scale path.** A single FastAPI instance is expected to handle 50 concurrent users. Redis pub/sub allows adding instances later without code changes to clients.

### Tech Stack
| Layer | Choice |
|---|---|
| Client | React + TypeScript, Three.js (via react-three-fiber — proposed), built with Vite on Node.js |
| Backend | Python, FastAPI, SQLAlchemy, Pydantic, native WebSockets |
| Database | PostgreSQL (proposed) |
| Ephemeral state | Redis (proposed; in-memory acceptable for single-instance MVP) |
| Runtime | Docker + Docker Compose for all services (client, api, db, redis) |
| Testing | pytest (backend), Vitest + React Testing Library (client), Playwright (E2E), Locust or k6 (load — KPI 3/4) |

### Core Data Model (initial)
- `User` (id, email, password_hash, display_name, avatar_color, created_at)
- `Product` (id, name, category, unit, default_price, owner_id — null for catalog products)
- `Cart` (user_id, updated_at) · `CartItem` (cart_id, product_id, quantity, unit_price)
- `Trip` (id, user_id, date, store_name, total) · `TripItem` (trip_id, product_id, quantity, unit_price)
- `Budget` (user_id, monthly_amount, currency)
- `Badge` (id, code, name) · `UserBadge` (user_id, badge_id, earned_at)

Money is stored as integer minor units (e.g. cents) to avoid floating-point errors.

### Integration Points
- REST API: `/auth`, `/products`, `/cart`, `/trips`, `/budget`, `/stats`, `/badges`.
- WebSocket: `/ws/store/{store_id}` — messages `join`, `move`, `chat`, `leave`, server `snapshot`.
- No third-party integrations in scope.

### Security & Privacy
- HTTPS/WSS in any non-local deployment; WebSocket connections require a valid auth token.
- Every REST query scoped by `user_id`; automated tests verify user A cannot read or modify user B's cart, trips, or budget.
- Rate limiting on auth (5 failed logins/min/IP) and chat (1 msg/s/user).
- Chat input sanitized to prevent XSS.
- Users can export (JSON/CSV) and permanently delete their account and data.

### Non-Functional Requirements
| Area | Requirement |
|---|---|
| Latency (REST) | p95 < 200 ms for cart and trip endpoints at 50 concurrent users |
| Latency (realtime) | p95 < 150 ms position update end-to-end (KPI 3) |
| Capacity | 50 concurrent users per store, 0 crashes over 30 min (KPI 4) |
| Resilience | Client auto-reconnects WebSocket with backoff; a realtime failure never blocks cart or checkout (REST keeps working) |
| Rendering | ≥ 50 FPS mid-range laptop; initial load < 5 s; 3D assets < 15 MB total |
| Accessibility | Dashboard and forms meet WCAG 2.1 AA; all 3D actions also reachable via the cart/product panels |
| Dev setup | `docker compose up` brings up the full stack from a clean clone in < 5 min |

---

## 5. Risks & Roadmap

### Phased Rollout
| Phase | Scope | Exit Criteria |
|---|---|---|
| **MVP — Solo Shopper** | Epics A, B, C, D1–D2; Docker setup; seeded catalog | Owner logs 4 consecutive weeks of real trips; KPI 2 and KPI 5 met |
| **v1.1 — Multiplayer** | Epic F (presence, privacy, chat) | KPI 3 and KPI 4 met in load test; privacy tests pass |
| **v1.2 — Gamification** | Epic E, D3 (price history) | 5 badges and weekly challenge live; KPI 1 tracked for 8 weeks |
| **v2.0 — Future** | Price intelligence, receipt OCR, mobile, shared lists, Blender store assets | Separate PRDs |

### Technical Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| 3D performance drops with many products/avatars | Medium | High | Instanced meshes, LOD, low-poly assets, FPS budget checked in CI |
| WebSocket broadcast load grows with users (O(n²) messages) | Medium | High | Fixed 10 Hz server tick with batched snapshots; area-of-interest filtering if > 50 users |
| Game polish crowds out the spending features that deliver the real value | High | Medium | MVP gates on spending KPIs, not visuals; gamification is its own phase |
| Manual price entry is tedious, so logging stops | Medium | High | Default to last price paid; quick "repeat last trip" action (candidate for MVP) |
| Private data leaks through the realtime channel | Low | High | Realtime layer has no DB access to shopping tables; automated privacy tests |
| Single developer, no deadline, so scope drifts | High | Medium | Ship phases in order; Non-Goals list is the default answer to new ideas |

---

## Open Questions
| # | Question | Default if unanswered |
|---|---|---|
| Q1 | Which currency (or multiple)? | Single currency, set per user |
| Q2 | Is "repeat last trip" in MVP? | Yes — it directly reduces logging effort |
| Q3 | One shared store for everyone, or separate rooms (e.g. friends-only)? | One public store in v1.1; private rooms later |
| Q4 | Where will it be hosted beyond local Docker? | Local only until v1.1 |
| Q5 | Should the catalog be seeded from a real product list? | Hand-made seed of ~100 common products |
