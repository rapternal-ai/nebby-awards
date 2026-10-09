# The Nebby Awards

A private neighborhood community platform with anonymous forums and annual community-voted awards.

A **Nebby** is a neighborhood community. Residents join through community vouching, post under a system-assigned pseudonym, and participate in annual awards that celebrate the best of their block.

## Features

- **Private by default** — Your real name and email are never shown. You interact as a friendly pseudonym like `spf-NebbyMember-03`.
- **Community vouching** — Two verified neighbors vouch for you to join. No strangers in your community.
- **Local feed** — Share updates, ask for help, give shout-outs. Only your neighbors can see and respond.
- **Annual awards** — Nominate and vote for neighbors who make the community great. Fun categories, real recognition.
- **Transparent moderation** — Community guidelines with audited moderation. Reports are handled fairly and logged.
- **Your data, your control** — Leave anytime. Delete your account. No addresses or sensitive personal info collected.

## Tech Stack

- [Next.js 16](https://nextjs.org/) (App Router) + React 19 + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Leaflet](https://leafletjs.com/) + [react-leaflet](https://react-leaflet.js.org/) for neighborhood boundary maps
- [Lucide React](https://lucide.dev/) for icons

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Auth

This MVP uses client-side demo authentication. Sign in with:

| Email              | Role                        |
| ------------------ | --------------------------- |
| `member@demo.com`  | Verified member (moderator) |
| `visitor@demo.com` | Visitor (no membership)     |

## Key Pages

| Route                      | Description                                |
| -------------------------- | ------------------------------------------ |
| `/`                        | Public landing page                        |
| `/auth/signin`             | Sign in                                    |
| `/auth/signup`             | Sign up                                    |
| `/create-nebby`            | Create a new neighborhood                  |
| `/nebby/[code]/feed`       | Community feed (posts, comments, reactions) |
| `/nebby/[code]/awards`     | Awards (nominate, vote, results)           |
| `/nebby/[code]/about`      | About page, members, guidelines            |
| `/nebby/[code]/join`       | Join request with vouch progress           |
| `/nebby/[code]/moderate`   | Moderator dashboard                        |
| `/settings`                | Account settings, privacy, delete          |

## Scripts

```bash
npm run dev    # Start development server
npm run build  # Production build
npm run start  # Start production server
npm run lint   # Run ESLint
```

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── auth/             # Sign in / sign up
│   ├── create-nebby/     # Create neighborhood (with map)
│   ├── nebby/[code]/     # Neighborhood pages (feed, awards, about, join, moderate)
│   └── settings/         # Account settings
├── components/
│   ├── ui/               # Shared UI components (Button, Card, Badge, etc.)
│   ├── header.tsx         # Site header with navigation
│   └── providers.tsx      # Demo auth context provider
├── lib/
│   ├── demo-auth.ts      # Client-side demo auth context
│   ├── demo-data.ts      # Seed data for all screens
│   └── utils.ts          # Utility functions
└── types/
    └── index.ts          # TypeScript domain types
```

## Current Status

**Phase 1 complete** — UI shell with demo data for all core screens. No backend integration yet.

### Remaining Phases

1. ~~Repo review & UI shell~~ (done)
2. Authentication & Nebby membership (Supabase Auth, RLS, vouching, pseudonym assignment)
3. Private feed & moderation (posts, comments, reactions, reports, authorization)
4. Awards lifecycle (categories, nomination, consent, voting, results)
5. Privacy/security pass (tenant isolation, RLS, account deletion, no data leakage)

## License

Private — not open source.
