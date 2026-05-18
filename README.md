# AI Support Hub - Enterprise Monorepo

Next-generation AI customer support platform built with a high-performance monorepo architecture.

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 20+
- Docker & Docker Compose

### 2. Installation
```bash
make setup
```

### 3. Start Development
```bash
make dev
```

## 🏗️ Architecture

- **Apps**
  - `apps/web`: Next.js 15 Frontend
  - `apps/api`: NestJS Backend
- **Packages**
  - `packages/database`: Prisma + PostgreSQL
  - `packages/shared`: Common types and Zod schemas

## 🛠️ Tech Stack
- **Frameworks**: Next.js, NestJS
- **Database**: PostgreSQL with `pgvector`
- **Cache**: Redis
- **AI**: OpenAI GPT-4o
- **Tooling**: Turborepo, Prisma, Tailwind CSS

## 📜 Commands
- `make dev`: Start all apps in watch mode
- `make build`: Build all packages
- `make db-migrate`: Push database schema
- `make docker-up`: Start Postgres & Redis
