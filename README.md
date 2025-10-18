![Zero Locker Hero](./public/og.png)

# 🔐 Zero Locker

> A modern, secure, and self-hosted password management solution built with Next.js 15, TypeScript, and PostgreSQL.

![Alt](https://repobeats.axiom.co/api/embed/ddb97c5d8a09738f5b597b2ba06c695f3cc937e9.svg "Repobeats analytics image")

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.x-black.svg)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748.svg)](https://www.prisma.io/)

## ✨ Features

- **🔒 End-to-End Encryption**: AES-256-GCM encryption for all sensitive data
- **🔑 Secure Credential Storage**: Store passwords, usernames, and account details with confidence
- **💳 Payment Card Management**: Securely store credit/debit card information
- **🤫 Secret Notes**: Encrypted storage for sensitive notes and information
- **📊 Password History Tracking**: Automatic tracking of password changes with timestamps
- **🔐 Secure Authentication**: Built with BetterAuth for robust user authentication
- **🎨 Modern UI**: Beautiful, responsive interface built with Tailwind CSS and shadcn/ui
- **🔍 Smart Search**: Quickly find credentials with powerful search and filtering
- **📱 Mobile-Friendly**: Fully responsive design for all devices
- **🌓 Dark Mode**: Built-in dark/light theme support
- **🚀 Self-Hosted**: Full control over your data with Docker deployment
- **📦 Easy Migration**: Import credentials from text files
- **🔄 Real-time Sync**: Instant updates across all your sessions

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18.x or higher ([Download](https://nodejs.org/))
- **pnpm** package manager
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop/))

### Verify Installation

Run these commands to verify everything is installed correctly:

```bash
# Check Node.js version
node --version
# Expected: v18.x or higher

# Check pnpm version (install with: npm install -g pnpm)
pnpm --version
# Expected: v8.x or higher

# Check Docker is installed and running
docker --version
# Expected: Docker version 20.x or higher

docker compose version
# Expected: Docker Compose version v2.x or higher

# If Docker commands fail, make sure Docker Desktop is running
```

> 💡 **Note**: If Docker is not installed, download it from [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/) and make sure Docker Desktop is running (look for the 🐳 icon).

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/findmalek/zero-locker.git
cd zero-locker
```

### 2. Install Dependencies

```bash
pnpm install
```

This will install all required packages including:

- Next.js and React
- Prisma ORM
- oRPC for API routes
- UI component libraries
- And many more...

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
# Copy the example environment file
cp .env.example .env  # Or create manually
```

Add the following variables to your `.env` file:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/zerolocker

# Application Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Authentication (IMPORTANT: Change this in production!)
BETTER_AUTH_SECRET=your-secret-key-minimum-32-characters-for-production

# Optional: Logo.dev API (for fetching website logos)
LOGO_DEV_TOKEN=your-logo-dev-token
NEXT_PUBLIC_LOGO_DEV_TOKEN=your-public-logo-dev-token
```

> ⚠️ **Security Note**: The `BETTER_AUTH_SECRET` should be a strong, random string (minimum 32 characters) in production. Generate one using:
>
> ```bash
> openssl rand -base64 32
> ```

## 🐳 Docker Setup

Zero Locker uses Docker to run PostgreSQL locally for development.

### 1. Pull the PostgreSQL Image

```bash
# Pull the official PostgreSQL 15 Alpine image
pnpm docker:pull

# Or manually:
docker pull postgres:15-alpine
```

### 2. Start the Database Container

```bash
# Start PostgreSQL in detached mode
pnpm docker:up

# This will:
# - Create a PostgreSQL 15 container
# - Expose it on port 5432
# - Create a database named 'zerolocker'
# - Set up with username: postgres, password: password
```

### 3. Verify Database is Running

```bash
# Check container status
pnpm docker:status

# View logs
pnpm docker:logs:tail

# You should see:
# ✅ database system is ready to accept connections
```

### 4. Run Database Migrations

```bash
# Generate Prisma Client and run migrations
pnpm db:migrate

# This will:
# - Create all necessary tables
# - Set up relationships
# - Apply any pending migrations
```

### 5. (Optional) Seed the Database

```bash
# Populate with sample data
pnpm db:reset-and-seed

# ⚠️ Warning: This will delete all existing data
```

### Docker Container Management

```bash
# View container status
pnpm docker:status

# View real-time logs
pnpm docker:logs

# View last 100 log lines
pnpm docker:logs:tail

# Restart the database
pnpm docker:restart

# Stop the database
pnpm docker:down

# Reset database (deletes all data and volumes)
pnpm docker:reset

# Clean up (removes containers, volumes, and images)
pnpm docker:clean
```

## 💻 Development

### Start the Development Server

```bash
# Start Next.js development server with Turbopack
pnpm dev

# Server will start at: http://localhost:3000
```

The development server includes:

- ⚡️ Turbopack for fast HMR (Hot Module Replacement)
- 🔄 Auto-reloading on file changes
- 🐛 Detailed error messages
- 📊 React Query DevTools (bottom-left corner)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
