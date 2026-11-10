# AEGIS admin in Railway

The existing corporate landing remains on service `alpadev-hechizo` in project `be38e426-6350-4a29-a62f-b05dc18da8dd`, environment `f013cf7a-d42d-4b91-947c-b13ae574e2c2`. A dedicated `alpadev-admin` service builds this monorepo Dockerfile and listens on IPv6 port 3000. Healthcheck: `/api/health`. No public service domain or DNS replacement is required.

The public Caddy service forwards `/dashboard/*`, `/login`, `/api/auth/*`, `/api/trpc/*`, `/_next/*` and `/brand/*` to `http://alpadev-admin.railway.internal:3000` through `DASHBOARD_UPSTREAM`. `/dashboard` redirects to `/dashboard/aegis`; public pages and the existing lead API keep their original handlers and storage volume. Admin responses are private/no-store. Caddy strips the internal Next middleware subrequest header.

## Authentication

Configure Railway protected variables: `LAB_ROOT_USERNAME`, `LAB_ROOT_PASSWORD_HASH` (bcrypt, no plaintext password), `LAB_ROOT_ONLY=1`, a random `NEXTAUTH_SECRET`, `NEXTAUTH_URL=https://alpadev.xyz`, `NEXT_PUBLIC_APP_URL=https://alpadev.xyz`, `NEXT_PUBLIC_APP_ENV=production`, `NODE_ENV=production`, `HOSTNAME=::`, `PORT=3000`, and `RESEND_EMAIL_DOMAIN=alpadev.xyz`. Never commit variable values.

The optional principal account receives ADMIN from the server and uses JWT sessions. Wrong-password attempts are limited in memory per IP on the single replica. When LAB_ROOT_ONLY is absent, existing Prisma-based authentication remains available. No database seeding or reset is performed. Legacy CRM/Infrastructure integrations still require their own configured providers; this deployment does not migrate or replace their databases or invent billing metrics.

## Private laboratory

`/dashboard/aegis` checks the shared server session and ADMIN role independently of middleware. It links to the existing owner-private lab by module. The lab retains its separate ChatGPT authentication and D1 persistence; this integration is not SSO and does not expose its financial seed in this repository. The SVG is copied from the real corporate website.

The deployed source is sent explicitly to the Railway service from the feature branch. Do not push main to deploy: its older workflow targets GCP. Existing Infrastructure source remains unchanged.

## Validation and rollback

Run the frontend TypeScript check and production build, then check wrong-password denial, the actual principal login, ADMIN session, anonymous redirect, logo and four module links. Browser-check desktop and 390px mobile layout. Confirm the exact Railway deployment reaches SUCCESS before updating the Caddy production proxy.

To remove the new access while preserving the website, restore the previous Caddyfile/index.html from the release backup or roll back the public service to its pre-integration successful deployment. Do not delete its `/data` volume. Changing the admin code does not change the private lab D1 data.
