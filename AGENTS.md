<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## The Nebby Awards — Project Info

### Commands
- `npm run dev` — Start development server (http://localhost:3000)
- `npm run build` — Production build
- `npm run lint` — ESLint

### Stack
- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- Leaflet + react-leaflet for maps
- lucide-react for icons

### Key Routes
| Path | Description |
|------|-------------|
| `/` | Public landing page |
| `/auth/signin` | Sign in |
| `/auth/signup` | Sign up |
| `/create-nebby` | Create a new neighborhood |
| `/nebby/[code]/feed` | Community feed |
| `/nebby/[code]/awards` | Awards (nominate, vote, results) |
| `/nebby/[code]/about` | About page, members, guidelines |
| `/nebby/[code]/join` | Join request + vouch progress |
| `/nebby/[code]/moderate` | Moderator dashboard |
| `/settings` | Account settings, privacy, delete |

### Demo Auth
Currently using client-side demo auth (`src/lib/demo-auth.ts`). Sign in with:
- `member@demo.com` — Verified member (moderator)
- `visitor@demo.com` — Visitor (no membership)

### Phase 1 Status
UI shell complete with demo data. No backend (Supabase) integration yet.

### Local Database (Postgres via Docker)
A local Postgres database is available via Docker Compose.

**Start the database:**
```bash
npm run db:up
```

**Run migrations:**
```bash
npm run db:migrate
```

**Seed demo data:**
```bash
npm run db:seed
```

**Generate migrations after schema changes:**
```bash
npm run db:generate
```

**Open Drizzle Studio:**
```bash
npm run db:studio
```

Connection string is in `.env.local`:
```
DATABASE_URL=postgres://nebby:nebby@localhost:5433/nebby
```

### Database-backed features
- Nebbys are now persisted to Postgres and loaded on app start.
- Creating a Nebby writes to the database and creates the founding moderator membership.
- Members, posts, award categories, and nominations are hydrated from the database when a Nebby becomes active.
- Creating a post, category, nomination, or vote now persists to Postgres.
- Category edits, enable/disable, reorder, and deletion persist to Postgres.
- Votes are recorded in the database when submitted and increment the nomination vote counts.
- Join requests are persisted to Postgres; the moderator dashboard loads them from the database and approve/reject actions update the database.

### Notes
- If port 5432 is already in use, the Docker Compose maps Postgres to host port 5433.
- To reset the database: `docker-compose down -v`, then rerun `db:migrate` and `db:seed`.
