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

For production, keep these connections separate:

- `DATABASE_URL`: write-capable PostgreSQL user, used for migrations and analytics writes.
- `DATABASE_READONLY_URL`: read-only PostgreSQL user, used by public blog page reads.

The expected production database is local to the VPS:

- database: `bsvgo_db`
- write user: `bsvgo`
- read-only user: `bsvgo_readonly`

## Deployment

The GitHub Actions workflow deploys `main` to a VPS through SSH. Required secrets:

- `SERVER_IP`
- `SERVER_USER`
- `SSH_PRIVATE_KEY`
- `DATABASE_URL`
- `DATABASE_READONLY_URL`
- `NEXT_PUBLIC_SITE_URL`

The deploy job installs dependencies, runs Drizzle migrations, builds the app, and reloads PM2 with `ecosystem.config.cjs`.

Production runtime expectations:

- server user: `bsvgo`
- project path: `/home/bsvgo/bsvgo`
- app port: `3000`
- PM2 app name: `bsvgo`
- Node.js and PM2 are available globally under `/usr/local/bin`
- Nginx terminates HTTP/HTTPS and reverse proxies to `127.0.0.1:3000`
- Cloudflare Origin Certificate files live under `/etc/ssl/cloudflare`

Useful production checks:

```bash
pm2 status
pm2 logs bsvgo --lines 100
curl --fail --max-time 15 http://127.0.0.1:3000/en
curl --fail --max-time 15 https://bsvgo.com/en
sudo nginx -t
sudo systemctl status nginx --no-pager
```
