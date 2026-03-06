<p align="center">
<img src="assets/icons/icon.png" width="150"  alt="logo">
</p>

# Prisma API

## Installation

### Environments

```bash
cp .env.example .env
```

```bash
nano .env
```

## Start all services in development mode with Docker:

```bash
docker compose -f docker-compose.dev.yml --env-file .env.dev -p prisma_api_dev up --build
```

## Run the API in detached, production-ready mode:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod -p prisma_api_prod up -d --build
```

## Running Migrations

1. Enter the running container:

```bash
docker exec -it prisma_api_dev sh
docker exec -it prisma_api_prod sh
```

2. Execute pending migrations:

```bash
npm run migrations:run
npm run migrations:run:prod
```

3. Seed the database inside the container:

```bash
npm run cli -- seed
npm run cli:prod -- seed
```

4. Exit the container:

```bash
exit
```

## Generating Migrations

```bash
npm run migrations:generate database/migrations/<MigrationName>
```

Example:

```bash
npm run migrations:generate database/migrations/create-places-table
```
