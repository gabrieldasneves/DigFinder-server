# DigFinder Server — Agent Notes

## Workspace Context

This repo (`Digfinder-server`) lives in the same parent folder as `Digfinder-app` — they are **two independent git repos**, not a monorepo. The app calls this server at `http://localhost:3333`.

**To run this server:**
```bash
npm start   # tsx watch src/server.ts → port 3333
```

**Required `.env` variables:**
```
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="<strong-random-secret>"
```

**To seed categories** (run once after DB reset):
```bash
npx prisma db seed
```

---

## Domain

DigFinder is a fossil discovery tracking platform. Users report fossil finds in the field with GPS coordinates, photos, and category tags. The community can browse all reported discoveries on an interactive map.

The project was migrated from an NLW Pocket tutorial (coupon/markets app by Rocketseat). The oldest migration creates `markets`, `rules`, and `categories` tables. The schema was fully replaced in June 2025 to the current `User / Discovery / Image / Verification / Category` model. This migration lineage leaves some naming inconsistencies across the codebase.

---

## Stack and Runtime

- **Node.js + TypeScript** — executed via `tsx watch` (no build step in dev).
- **Express 4** — HTTP framework.
- **Prisma 5 + SQLite** — ORM with a local `prisma/dev.db` file.
- **Zod** — request body validation in controllers.
- **JWT (`jsonwebtoken`) + bcrypt** — auth tokens and password hashing.
- **Path alias**: `@/*` resolves to `./src/*` via tsconfig.

---

## Data Model

### User
`id` (UUID), `email` (unique), `password` (bcrypt, cost 10), `name`, `isVerified` (Boolean, default `false`), timestamps.
- `isVerified` is never checked or enforced by any active code path.

### Category
`id`, `name` (unique), `description?`, `createdAt`.
- Seeded with 10 fossil types: Body Fossils, Trace Fossils, Molds and Casts, Permineralized Fossils, Amber Fossils, Carbon Film Fossils, Recrystallized Fossils, Coprolites, Gastroliths, Others.
- Many-to-many with `Discovery` via a Prisma implicit join table.

### Discovery (core entity)
`id`, `title`, `description?`, `latitude` (Float), `longitude` (Float), `discoveryDate` (DateTime), `status` (String, default `"pending"`), `verifiedBy?`, `verificationDate?`, `userId` (FK → User).
- The `status` / `verifiedBy` / `verificationDate` fields are designed for a moderation/verification workflow that is **not yet implemented** in any controller.
- Many-to-many with `Category`; one-to-many with `Image`.

### Image
`id`, `url` (Firebase Storage download URL), `isPrimary` (Boolean), `orderIndex` (Int), `createdAt`, `fossilFindId` (FK → Discovery, `onDelete: Cascade`).
- The first image uploaded (`index === 0`) is automatically flagged `isPrimary: true`.
- Images are stored externally in Firebase Storage. The backend only holds the URL. **Deleting a Discovery does not cascade to Firebase Storage** — orphaned images remain in Firebase.

### Verification
`id`, `token` (unique), `type` (`"email"` | `"password_reset"`), `expiresAt`, `createdAt`, `userId` (FK → User).
- The schema exists but **no controller ever writes to this table**. It is a planned feature.

---

## API Design

There are two separate API surfaces for discoveries, with different auth requirements and scoping.

### Auth (`/auth`)
| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/auth/signup` | No | Returns user object; does NOT auto-login. |
| POST | `/auth/login` | No | Returns `{ user, token }`. Token expires in 24h. |
| POST | `/auth/logout` | No | Stateless — returns 200. Invalidation is client-side only. |
| POST | `/auth/forgot-password` | No | Generates a 1h JWT reset token and **returns it directly in the response body**. This is a known TODO — in production, it should be sent by email only. |
| GET | `/auth/me` | Bearer (manual check) | Decodes token, returns user without password. |

### Categories (`/categories`)
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/categories` | No | Returns all categories ordered by name asc. |

### Discoveries (`/discoveries`) — all behind `authenticateToken` middleware
| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/discoveries/createDiscovery` | Yes | Validates with Zod. Creates discovery, connects categories by ID array, creates Image records. |
| GET | `/discoveries/getDiscoveries` | Yes | Returns **only the authenticated user's own discoveries** (scoped by `userId`). |
| GET | `/discoveries/getDiscoveryById/:id` | Yes | Returns a specific discovery owned by the current user. |
| PUT | `/discoveries/updateDiscovery/:id` | Yes | Replaces category relations entirely via Prisma `set`. Ownership-checked. |
| DELETE | `/discoveries/deleteDiscovery/:id` | Yes | Ownership-checked. Returns 204. |

### Registers (`/registers`) — **public, no auth**
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/registers` | No | All discoveries from all users, ordered by title. Includes categories, primary image, and author id+name. |
| GET | `/registers/category/:category_id` | No | Filters by category. |
| GET | `/registers/:id` | No | Single discovery detail with all images and author id+name+email. |

---

## Middleware

### `authenticateToken`
Extracts `Authorization: Bearer <token>`, verifies with `JWT_SECRET`, attaches `{ id }` to `req.user`. Returns 401 on missing or invalid token.

### `errorHandling`
Global error handler. Distinguishes:
- `AppError` (custom class with `statusCode`) → returns that status code.
- `ZodError` → returns 400 with formatted issue list.
- All others → returns 500.

---

## Known Bugs and Technical Debt

### Route Duplication
In `server.ts`, `categoriesRoutes` and `discoveriesRoutes` are mounted **twice**: once directly on `app` and once inside the `routes` index router. This means routes like `/categories` and `/discoveries/createDiscovery` are accidentally registered at multiple paths. This is likely unintentional.

### Forgot Password Returns Token in Response
`POST /auth/forgot-password` returns the reset token directly in the response body. This is only safe in development. In production, the token should be delivered by email, not exposed in the API response.

### No Image Cleanup on Discovery Deletion
When a `Discovery` is deleted, `Image` records cascade-delete from the database, but the corresponding files in Firebase Storage are not removed. This will accumulate orphaned files over time.

### Email Verification Not Enforced
The `User.isVerified` field and the `Verification` table exist but are never used. There is no email verification flow, and `isVerified` is never checked during login or any other operation.

### `JWT_SECRET` in `.env` is Insecure
The `.env` file contains a hardcoded, weak example value for `JWT_SECRET`. This must be replaced with a strong, randomly generated secret before any production deployment.

### Validation Request Body Schema
The Zod `discoverySchema` requires `imageUrls` to be optional, but `categoryIds` is required as a UUID array. If the frontend passes a single category ID instead of an array, the request will fail validation.

---

## Pending / Stubbed Features

- **Email verification flow** — `Verification` table + `isVerified` field exist but nothing writes to them.
- **Discovery moderation/verification workflow** — `status`, `verifiedBy`, `verificationDate` on Discovery are populated only with defaults; no admin endpoint exists to transition them.
- **Forgot password email delivery** — currently returns the token in the HTTP response.

---

## Environment Variables

| Variable | Description | Notes |
|---|---|---|
| `DATABASE_URL` | Prisma SQLite connection string | `file:./dev.db` in dev |
| `JWT_SECRET` | Secret for signing/verifying JWTs | Must be strong and secret in production |
