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
