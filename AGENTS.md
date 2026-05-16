# AGENTS.md

## Project

BSVgo is an English-first, Chinese-supported technology blog about blockchain, AI, and infrastructure.

This repository is the public blog frontend. Do not add admin dashboards, login pages, upload flows, comments, favorites, or unrelated product features here.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS
- PostgreSQL
- Drizzle ORM
- PM2 for VPS runtime
- GitHub Actions for deployment

## Main Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run db:migrate
npm run db:seed
```

Use `npm run db:seed` only for local or first-time demo data setup. Do not add it back to the production deploy workflow unless explicitly requested, because production content is database-managed.

## Content Model

The site is database-driven first and falls back to static seed content only if database reads fail.

Core content tables:

- `categories`
- `category_translations`
- `posts`
- `post_translations`
- `tags`
- `post_tags`

English is the primary content language. Chinese is supported through locale routes and translation rows.

## Routes

- `/` redirects to `/en`
- `/[locale]`
- `/[locale]/category/[slug]`
- `/[locale]/posts/[slug]`
- `/[locale]/tag/[slug]`

Supported locales are defined in `lib/i18n.ts`.

The main blog pages are intentionally dynamic so newly added database content can appear without rebuilding static route lists.

## Important Files

- `app/[locale]/page.tsx`: localized home page route
- `app/[locale]/posts/[slug]/page.tsx`: article detail route
- `app/[locale]/category/[slug]/page.tsx`: category route
- `app/[locale]/tag/[slug]/page.tsx`: tag archive route
- `components/home-page.tsx`: home page composition
- `components/site-shell.tsx`: header, navigation, footer
- `components/brand-logo.tsx`: reusable logo
- `lib/blog.ts`: database reads and fallback content mapping
- `lib/content.ts`: fallback categories/posts and tag helpers
- `lib/i18n.ts`: locales and UI copy
- `db/schema.ts`: Drizzle schema
- `.github/workflows/bsvgo.yml`: VPS deployment workflow

## Design Direction

Keep the visual style consistent:

- clean technology blog
- light backgrounds
- emerald/teal/lime accents
- no harsh black sections
- no dashboard/admin visual language
- cards are acceptable for article previews
- responsive behavior must work on mobile, tablet, and desktop

Use `lucide-react` icons when icons are needed.

## Database Rules

- Use Drizzle schema and migrations for structural changes.
- Do not hand-edit production database assumptions into page components.
- New multilingual content should have `posts` plus matching `post_translations` rows.
- Tags should use `tags` plus `post_tags`.
- If a page cannot find content, use `notFound()` and the existing friendly 404 UI.

## Deployment Notes

Production deploy runs through GitHub Actions and SSH into the VPS.

Expected production runtime:

- app user: `bsvgo`
- project path: `/home/bsvgo/bsvgo`
- app port: `3000`
- PM2 app name: `bsvgo`

Do not use `sudo pm2` for this project. PM2 should run under the `bsvgo` user.

Required GitHub Secrets:

- `SERVER_IP`
- `SERVER_USER`
- `SERVER_PORT`
- `SSH_PRIVATE_KEY`
- `DATABASE_URL`
- `NEXT_PUBLIC_SITE_URL`

## Verification

Before finishing code changes, run:

```bash
npm run build
```

If Turbopack fails locally because the sandbox blocks helper processes or port binding, rerun the build outside the sandbox when allowed.

For server verification:

```bash
pm2 status
pm2 logs bsvgo --lines 100
curl --fail --max-time 15 http://127.0.0.1:3000/en
```

## Editing Constraints

- Keep changes scoped to the requested feature or fix.
- Do not reintroduce old business code.
- Do not add a backend/admin system to this frontend repo.
- Do not remove user content or reset database data.
- Avoid destructive git or database operations unless explicitly requested.
