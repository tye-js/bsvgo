# BSVgo

BSVgo is an English-first, Chinese-supported technology blog about blockchain, AI, and infrastructure.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- PostgreSQL
- Drizzle ORM
- GitHub Actions deployment to VPS

## Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. The default route redirects to `/en`.

## Database

Configure `DATABASE_URL` for write/migration access and `DATABASE_READONLY_URL`
for public blog reads, then run:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

The schema models categories and posts with translation tables so English and Chinese content can be maintained independently.

## Deployment

The GitHub Actions workflow deploys `main` to a VPS through SSH. Required secrets:

- `SERVER_IP`
- `SERVER_USER`
- `SSH_PRIVATE_KEY`
- `DATABASE_URL`
- `DATABASE_READONLY_URL`
- `NEXT_PUBLIC_SITE_URL`

The deploy job installs dependencies, runs Drizzle migrations, builds the app, and reloads PM2 with `ecosystem.config.cjs`.
