# Cartex Pro

Cartex Pro is a `Next.js` ecommerce application using:

- `Next.js` standalone output
- `Prisma` for database access

This project is designed to be shipped as one Docker image and run in different environments by passing runtime environment variables. The database is external and must be provided with `DATABASE_URL`.

## How Deployment Works

The intended production flow is:

1. Build one Docker image.
2. Push that image to a registry.
3. Run the image anywhere.
4. Pass all required environment variables at runtime.
5. Update by pulling the latest image and restarting the container.

This means:

- the app image should stay generic
- the database should stay outside the container
- secrets should not be baked into the image

### Server Runtime Variables

These are required for the app server to work correctly:

```env
DATABASE_URL=
ZDRIVE_KEY=
ZDRIVE_SECRET=
SMTP_HOST=
SMTP_USER=
SMTP_PASSWORD=
JWT_SECRET=
ZAUTH_SECRET=
```

### Public Runtime Variables

These are exposed to the browser through `next-runtime-env` and are also required:

```env
NEXT_PUBLIC_URL=
NEXT_PUBLIC_ZAUTH_KEY=
NEXT_PUBLIC_ZDRIVE_ROOT=
```

## What Each Variable Means

### Database

- `DATABASE_URL`
  - Connection string for your external PostgreSQL database.
  - Example:

```env
DATABASE_URL=postgresql://postgres:password@db.example.com:5432/cartex
```

### Drive / Media

- `ZDRIVE_KEY`
  - Server-side API key for your media/file service.
- `ZDRIVE_SECRET`
  - Server-side API secret for your media/file service.
- `NEXT_PUBLIC_ZDRIVE_ROOT`
  - Public base URL for loading uploaded files in the browser.

### Auth

- `ZAUTH_SECRET`
  - Secret used by server-side auth validation.
- `NEXT_PUBLIC_ZAUTH_KEY`
  - Public auth key needed by the frontend.
- `JWT_SECRET`
  - Secret used for JWT-related application flows.

### Mail

- `SMTP_HOST`
  - Mail server host.
- `SMTP_USER`
  - Mail server username.
- `SMTP_PASSWORD`
  - Mail server password.

### Public App URL

- `NEXT_PUBLIC_URL`
  - Public website URL.
  - Example:

```env
NEXT_PUBLIC_URL=https://shop.example.com
```

## Quick Start For Beginners

## What You Need To Ask Or Collect Before Setup

Before anyone deploys this system, collect these values first:

### Database Information

- PostgreSQL host
- PostgreSQL port
- PostgreSQL database name
- PostgreSQL username
- PostgreSQL password

These are used to build:

```env
DATABASE_URL=postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME
```

### File / Media Service Information

- `ZDRIVE_KEY`
- `ZDRIVE_SECRET`
- `NEXT_PUBLIC_ZDRIVE_ROOT`

### Auth Information

- `ZAUTH_SECRET`
- `NEXT_PUBLIC_ZAUTH_KEY`
- `JWT_SECRET`

### Email Information

- `SMTP_HOST`
- `SMTP_USER`
- `SMTP_PASSWORD`

### Public Website Information

- `NEXT_PUBLIC_URL`

If the end user does not have these values yet, deployment should stop there. The container cannot start correctly without them.

### 1. Prepare a PostgreSQL Database

You need a PostgreSQL database running outside the app container.

You can use:

- a managed database service
- a PostgreSQL server on another machine
- a separate database container

Copy the PostgreSQL connection string. You will use it as `DATABASE_URL`.

### 2. Create a Runtime Environment File

Create a file named `.env.runtime` with all required values:

```env
DATABASE_URL=postgresql://postgres:password@db.example.com:5432/cartex
ZDRIVE_KEY=your_zdrive_key
ZDRIVE_SECRET=your_zdrive_secret
SMTP_HOST=smtp.example.com
SMTP_USER=no-reply@example.com
SMTP_PASSWORD=your_smtp_password
JWT_SECRET=your_jwt_secret
ZAUTH_SECRET=your_zauth_secret
NEXT_PUBLIC_URL=https://shop.example.com
NEXT_PUBLIC_ZAUTH_KEY=your_public_zauth_key
NEXT_PUBLIC_ZDRIVE_ROOT=https://drive.example.com
```

Important:

- do not put quotes around values unless needed
- do not commit this file to git
- keep this file on the server where the container runs

## Run With Docker

### Pull The Image

Example:

```bash
docker pull ghcr.io/fathah/cartex-pro:latest
```

### Start The Container

```bash
docker run -d \
  --name cartex-pro \
  --restart unless-stopped \
  --env-file .env.runtime \
  -p 3000:3000 \
  ghcr.io/fathah/cartex-pro:latest
```

Open the app at:

```txt
http://YOUR_SERVER_IP:3000
```

## Run Database Migrations

The container supports optional startup migrations.

If you want the container to run Prisma migrations on startup:

```bash
docker run -d \
  --name cartex-pro \
  --restart unless-stopped \
  --env-file .env.runtime \
  -e RUN_DATABASE_MIGRATIONS=true \
  -p 3000:3000 \
  ghcr.io/fathah/cartex-pro:latest
```

Recommended:

- use `RUN_DATABASE_MIGRATIONS=true` only when you intentionally want that container to apply schema changes
- for multiple app instances, prefer running migrations once before scaling out

## Local Development

### Install Dependencies

```bash
npm ci
```

### Generate Prisma Client

```bash
npx prisma generate
```

### Run Migrations

```bash
npx prisma migrate deploy
```

If you are developing locally and creating new migrations:

```bash
npx prisma migrate dev
```

### Start The Development Server

Create a local `.env.local` file with the same required variables, then run:

```bash
npm run dev
```

## GitHub Actions Deployment

This repository now uses two workflows:

- `.github/workflows/docker.yaml`
  - builds and pushes the Docker image to `ghcr.io`
- `.github/workflows/deploy.yaml`
  - pulls the image on the server and starts the container

## What GitHub Secrets And Variables You Need

### Required GitHub Secrets

Set these in your GitHub repository settings:

- `SERVER_HOST`
  - your server IP or domain
- `SERVER_USER`
  - SSH username on the server
- `SERVER_SSH_KEY`
  - private SSH key used by GitHub Actions
- `GHCR_TOKEN`
  - token the server can use to pull images from `ghcr.io`
- `RUNTIME_ENV_FILE`
  - the full contents of your runtime env file

Example value for `RUNTIME_ENV_FILE`:

```env
DATABASE_URL=postgresql://postgres:password@db.example.com:5432/cartex
ZDRIVE_KEY=your_zdrive_key
ZDRIVE_SECRET=your_zdrive_secret
SMTP_HOST=smtp.example.com
SMTP_USER=no-reply@example.com
SMTP_PASSWORD=your_smtp_password
JWT_SECRET=your_jwt_secret
ZAUTH_SECRET=your_zauth_secret
NEXT_PUBLIC_URL=https://shop.example.com
NEXT_PUBLIC_ZAUTH_KEY=your_public_zauth_key
NEXT_PUBLIC_ZDRIVE_ROOT=https://drive.example.com
```

### Required GitHub Variables

Set these as repository variables:

- `SERVER_DEPLOY_PATH`
  - folder on the server where the runtime env file will be written

### Optional GitHub Variables

- `CONTAINER_NAME`
  - default: `cartex-pro`
- `APP_PORT`
  - default: `3000`
- `RUN_DATABASE_MIGRATIONS`
  - default: `false`

## How Updates Work

Once your workflows are configured:

1. push to `main`
2. GitHub builds and publishes a new image
3. deploy workflow connects to your server
4. server pulls the new image
5. old container is removed
6. new container starts with the same runtime env file

This is why the end user only needs to manage runtime env values and database access.

## Common Problems

### App starts but database fails

Check:

- `DATABASE_URL` is correct
- database host is reachable from the server
- PostgreSQL user has permission
- migrations were applied

### Images or media do not load

Check:

- `NEXT_PUBLIC_ZDRIVE_ROOT` is correct
- `ZDRIVE_KEY` and `ZDRIVE_SECRET` are valid

### Email does not send

Check:

- `SMTP_HOST`
- `SMTP_USER`
- `SMTP_PASSWORD`

### Auth fails

Check:

- `ZAUTH_SECRET`
- `NEXT_PUBLIC_ZAUTH_KEY`
- `JWT_SECRET`

## Recommended Production Notes

- keep PostgreSQL outside the app container
- store runtime env values on the server or in your secret manager
- do not bake secrets into the Docker image
- avoid running migrations from every app instance in a scaled deployment
- use immutable image tags such as `sha-...` for controlled rollouts

## Summary

To run this app successfully, the end user mainly needs:

1. a PostgreSQL database
2. a valid runtime env file
3. the Docker image
4. Docker installed on the server

That is the minimum setup needed to start the container correctly.
