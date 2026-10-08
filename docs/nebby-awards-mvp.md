# The Nebby Awards — MVP Build Brief

## Instructions for Claude Code

Build a usable, mobile-first MVP for **The Nebby Awards**, a neighborhood community platform with an anonymous-to-neighbors forum and annual, community-voted awards.

Before changing code:
1. Inspect the repository, existing framework, conventions, and available dependencies.
2. Summarize the current app structure and propose a short implementation sequence.
3. Preserve working functionality and follow the repo's existing patterns where practical.
4. If this is an empty repository, use the suggested stack below.
5. Implement in small, runnable steps. Do not leave core screens as static mockups if the project already has a backend configured. If credentials or external services are missing, make the UI usable with seeded/demo data and clearly mark the integration boundary.

Do not publish or deploy the app. Do not put secrets in source control.

## Product summary

A **Nebby** is a neighborhood community. Residents can join through community vouching, post under a system-assigned pseudonym, and participate in annual awards. The product should feel friendly, playful, local, and safe.

The core privacy idea is Ring-like pseudonymity: a member’s real name and exact home address are not shown to other members. Nebby adds community scoping: posts and award activity are visible only to approved members of the same Nebby.

## MVP goals

1. Let an organizer create a Nebby and define its name and geographic boundary.
2. Let neighbors request to join and become verified through two independent vouches from existing verified members.
3. Assign every approved member a pseudonymous username that is unique within that Nebby.
4. Provide a private-to-members community feed for posts and comments.
5. Run a simple yearly awards cycle: nominations, voting, and winner announcement.
6. Provide basic moderation and reporting controls.

## Suggested stack for a new project

- Next.js App Router, React, TypeScript
- Tailwind CSS; use the repository's existing component library if present
- Supabase Auth and Postgres, with Row Level Security (RLS)
- MapLibre or Leaflet for the boundary editor if a map library is needed
- Keep map data modular; do not make a paid geocoding or election-data API a prerequisite for the MVP

If the repository already uses a suitable stack, adapt to it rather than replacing it without a strong reason.

## User roles

- **Visitor:** Can view the public landing page, create an account, and request to join a Nebby. Cannot see community content.
- **Pending member:** Can see the status of their join request and send private vouch requests. Cannot post, nominate, or vote until approved.
- **Verified member:** Can see and participate in their Nebby, subject to the current awards phase.
- **Organizer/moderator:** Can configure the Nebby, review reports, manage membership and awards, and moderate content. Keep moderator actions auditable.
- **Platform administrator:** MVP-only role for approving or recovering founder communities and resolving exceptional cases.

## Neighborhoods (Nebbies)

- Each Nebby has an internal unique ID, a user-facing short code, a display name, an optional description, and a map boundary.
- Example internal ID: `nebby-xyz`; short code: `xyz`.
- An organizer creates the Nebby, sets its boundary, and invites neighbors.
- Boundary selection should support an organizer-drawn or adjusted polygon. Election precinct/voting-district layers may be offered later as suggested outlines; they are not the definition of a neighborhood and must not be required for the MVP.
- Members of one Nebby must not see another Nebby's posts, nominations, member list, or votes.
- Do not expose member addresses or exact member locations in the UI, API responses, logs, or analytics.

### Founder and first-member bootstrap

The two-vouch rule cannot verify the first members by itself. For the MVP, let a platform administrator manually approve the organizer/founding group. Once a Nebby has verified members, normal join requests require two vouches. Keep this bootstrap operation separate from regular membership approval and record it in an audit log.

## Membership and community vouching

- Joining requires an account and a request to join a specific Nebby.
- The request is approved after **two different verified members of that same Nebby** independently vouch for the applicant.
- Do not count duplicate vouches from the same account. Vouchers must be verified members and cannot vouch for themselves.
- Store who vouched and when for abuse review, but do not show voucher identities publicly. The applicant may see that the request has received 0, 1, or 2 vouches; moderators can inspect the details.
- Add a simple organizer review path for people who do not yet know two members, plus a rate limit on vouches.
- Do not collect home addresses, utility bills, government IDs, or precise location in the MVP.
- Use email for account sign-in only. Do not display it to other members.
- Leaving or removal revokes access immediately. Preserve the member number so it is never reassigned.

## Pseudonymous usernames

After a member is approved, assign a stable username from the Nebby's short code and a per-Nebby sequence:

- `xyz-NebbyMember-01`
- `xyz-NebbyMember-02`
- `xyz-NebbyMember-03`

Rules:
- Assign the next available number on the server/database only after approval.
- Enforce uniqueness within the Nebby with a database constraint or equivalent.
- Never reuse a number after a member leaves or is removed.
- A person joining another Nebby receives a different pseudonym there; do not use a globally shared public username.
- Display this pseudonym on posts, comments, nominations, and voting-related UI. Never display email or legal name.
- Use an atomic counter or transaction to avoid duplicate sequence numbers when approvals happen at the same time.

## Community feed

- Feed posts and comments are visible only to verified members of that Nebby.
- Members post and comment using their Nebby pseudonym.
- MVP actions: create a text post, edit/delete own post, comment, react with a small set of positive reactions, and report a post or comment.
- Moderators can hide/remove reported content and record a reason in the moderation log.
- Do not allow posts containing another person's private contact details, exact home address, or identifying information without consent. Add a visible community guideline before posting.
- Do not support direct messages, public search-engine indexing, or cross-posting outside Nebby in the MVP.

## Annual awards and voting

Each Nebby can run one annual awards season with configurable start/end dates.

### Suggested starter categories

- Neighborhood MVP
- Best Block Decor
- Always Has the Right Tool
- Most Likely to Turn a Quick Chat into a 30-Minute Visit

Organizers can enable, disable, or edit categories for their Nebby.

### Flow

1. **Nomination phase:** Verified members nominate someone in a category and add an optional positive explanation.
2. **Nomination review:** Organizer can remove nominations that violate community rules. Keep nominator identity private from other members; moderators may inspect it for abuse handling.
3. **Nominee consent:** Before publishing a nominee's identity or profile information, request consent. If the nominee declines or does not respond, allow the organizer to withdraw the nomination or show only the Nebby pseudonym.
4. **Voting phase:** Verified members cast one vote per category. A member cannot vote more than once in a category; allow changing their vote until voting closes.
5. **Results:** After voting closes, display winner(s) and vote totals or winner-only results, depending on a Nebby setting. Default to winner-only results to reduce popularity pressure.

- Do not support downvotes, negative categories, public nomination counts before voting, or comments that target a neighbor.
- Store votes so the system can enforce one vote per member per category. Do not display who voted for whom.
- Handle ties with a clear tied-winner state in the MVP; do not silently break ties.

## Privacy and security requirements

- Private-by-default community content: authorize every read and write against verified membership in the relevant Nebby.
- Use Supabase RLS or equivalent server-side authorization. Hiding UI controls is not sufficient access control.
- Public identity is the per-Nebby pseudonym. Keep login email private and accessible only to the account and authorized platform operations.
- Do not ask for or store home addresses in the MVP.
- Avoid collecting sensitive profile fields, photos, or precise location.
- Prevent public indexing of private pages and ensure unauthenticated requests cannot retrieve community content.
- Keep moderation and platform-admin actions in an audit log.
- Provide account deletion and a way to leave a Nebby. Deletion should remove or anonymize personal account data while keeping non-identifying award totals and moderation records only as needed for integrity.
- Do not include real names, emails, tokens, or secrets in logs.

## Core data model (suggested)

Adapt names to existing conventions. Enforce tenant/community scoping in queries and policies.

- `profiles`: auth user ID, account status, created timestamp
- `nebbies`: ID, name, short code, description, boundary geometry, creator ID, status, created timestamp
- `memberships`: Nebby ID, user ID, member number, generated username, status, role, approved timestamp; unique `(nebby_id, user_id)` and `(nebby_id, member_number)`
- `join_requests`: Nebby ID, applicant user ID, status, created timestamp, reviewed timestamp
- `vouches`: Nebby ID, join request ID, voucher user ID, created timestamp; unique `(join_request_id, voucher_user_id)`
- `posts`: Nebby ID, author user ID, body, status, created/updated timestamps
- `comments`: Nebby ID, post ID, author user ID, body, status, created/updated timestamps
- `reactions`: Nebby ID, post/comment target, user ID, reaction type; constrain one reaction per member/target/type as appropriate
- `reports`: Nebby ID, reporter user ID, target type/ID, reason, status, moderator user ID, resolution timestamp
- `award_seasons`: Nebby ID, year, nomination start/end, voting start/end, status
- `award_categories`: season ID, name, description, display order, enabled
- `nominations`: category ID, nominee membership ID or pending nominee record, nominator user ID, explanation, consent status, moderation status, created timestamp
- `votes`: category ID, voter user ID, nomination ID, created/updated timestamp; unique `(category_id, voter_user_id)`
- `audit_log`: Nebby ID when applicable, actor ID, action, target type/ID, reason, timestamp

## Key screens

1. Public landing page explaining Nebby and privacy in plain language.
2. Sign up / sign in.
3. Create Nebby: name, short code generation, boundary setup, invite link.
4. Nebby home: tabs for Feed, Awards, and About/Guidelines.
5. Join request status with vouch progress.
6. Private moderator membership queue and report queue.
7. Feed with post composer, comments, reactions, and report action.
8. Awards: phase-aware nomination, nominee review/consent, voting, and results screens.
9. Basic member settings: account deletion, leave Nebby, and privacy explanation.

Use responsive layouts with accessible labels, keyboard support, clear empty states, and useful error messages.

## Non-goals for the MVP

- Address-based eligibility checks, document verification, or voter-registration lookups
- Automated election/precinct boundary ingestion
- Direct messages, real-time video, camera integrations, or location tracking
- Public global feed or search across Nebbies
- Payments, ads, or monetization
- Complex ranking, badges, leaderboards, or public individual vote histories

## Suggested implementation phases

1. **Repo review and UI shell:** inspect the project, establish route/layout structure, and build responsive screens using representative demo data.
2. **Authentication and Nebby membership:** implement accounts, community creation, admin bootstrap approval, join requests, vouching, and pseudonym assignment.
3. **Private feed and moderation:** implement posts, comments, reactions, reports, and authorization tests.
4. **Awards lifecycle:** implement categories, nomination, consent, voting, and results.
5. **Privacy/security pass:** verify tenant isolation, RLS, account deletion, and no leakage of email or address data.

Do not try to build every phase in one large change. Keep the app runnable after each phase and report what works, what remains, and how to run it.

## Acceptance criteria

- A new Nebby can be created with a unique ID, short code, name, and boundary.
- The organizer/founding group can be approved through a documented admin-only bootstrap path.
- A join request cannot become approved with fewer than two distinct verified vouches, except through the authorized moderator exception path.
- Approved members receive stable, unique per-Nebby pseudonyms such as `xyz-NebbyMember-01`; numbers are not reused.
- A verified member can create a post and comment, and sees the pseudonym rather than email or real name.
- A user who is not a verified member of a Nebby cannot read that Nebby's feed or awards data, even by making a direct request.
- A member can submit a nomination and cast at most one vote per category; vote identity is not shown to other members.
- A moderator can review reports and hide/remove violating content, with an audit entry.
- The interface explains what other members can see and what stays private.
- The project runs locally using the documented commands and environment variable names; no secret values are committed.

## Claude Code delivery format

At the end of each implementation phase, report:
- Files/features changed
- Commands to run the app
- Required environment variables (names only)
- Manual verification steps performed
- Known limitations or decisions that still need product input
