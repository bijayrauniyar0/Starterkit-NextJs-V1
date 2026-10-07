# Fullstack Starter Kit

Welcome to the **Fullstack Starter Kit**. This repository provides a scalable, modern foundation for building full-stack web applications. It consists of a robust Node.js backend and a Next.js frontend, both written in TypeScript and configured with best practices for development.

## Table of Contents
- [Prerequisites](#prerequisites)
- [How to Clone & Initial Setup](#how-to-clone--initial-setup)
- [Husky & Git Hooks](#husky--git-hooks)
- [Overview of Backend](#overview-of-backend)
- [Overview of Frontend](#overview-of-frontend)
- [Quick Start Guide](#quick-start-guide)

---

## Prerequisites

Make sure you have the following installed on your machine:
- **Node.js** (v18 or higher recommended)
- **pnpm** (preferred package manager)
- **Docker & Docker Compose** (for running background services like PostgreSQL and Redis)
- **Git**

## How to Clone & Initial Setup

To get started, clone the repository to your local machine:

```bash
# Clone the repository
git clone https://github.com/bijayrauniyar0/fullstack-starter-kit-v1.git

# Navigate into the project directory
cd fullstack-starter-kit-v1

# Install dependencies at the root
pnpm install
```

## Husky & Git Hooks

This project enforces code quality standards using **Husky** and **lint-staged**. 

Running `pnpm install` at the project root will automatically set up Git hooks. When you attempt to commit code, Husky will run pre-commit checks:
- **Prettier**: Formats your code.
- **ESLint**: Lints your code to catch syntax and standard errors.

These automated checks help maintain a consistent code style across the entire repository.

---

## Overview of Backend

Located in the [`/backend`](./backend) directory, the server is designed with a feature-based modular architecture.

**Tech Stack**:
- **Framework**: Express.js (Node.js)
- **Language**: TypeScript
- **Database**: PostgreSQL with Sequelize ORM
- **Cache / Session**: Redis
- **Containerization**: Docker Compose

**Key Highlights**:
- Features are strictly encapsulated inside `src/modules/` (e.g., Auth, User).
- Includes structured error handling, JWT-based authentication, and pagination utilities.
- Uses Docker Compose to easily spin up dependencies (DB & Redis).

> 📖 **Read more**: Check the [Backend README](./backend/README.md) for detailed instructions on setting up environment variables, database configuration, and running the server.

---

## Overview of Frontend

Located in the [`/frontend`](./frontend) directory, the client is a robust Next.js application built with performance and maintainability in mind.

**Tech Stack**:
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & generic UI primitives
- **API Fetching**: Custom API client integrated with features

**Key Highlights**:
- Uses a strict **feature-based architecture**. Pages act as thin wrappers around logic securely housed within `src/features/`.
- Prioritizes **Server Components** by default. Client components are isolated to interactive "leaves" in the DOM tree.
- Centralized API requests prevent component bloat and logic duplication.

> 📖 **Read more**: Check the [Frontend README](./frontend/README.md) for deep dives into architectural rules, component patterns, and state management.

---

## Quick Start Guide

Once you've cloned the repository and ran `pnpm install` in the root:

1. **Start Backend Services**:
   Navigate to the backend and configure your environment:
   ```bash
   cd backend
   cp .env.sample .env
   # Make sure to update the .env values as needed

   # Spin up the Database and Redis
   docker compose up --build
   ```

2. **Run Backend (if not handled by Docker)**:
   ```bash
   # Make sure you are in the /backend directory
   pnpm run dev
   ```

3. **Run Frontend**:
   Open a new terminal window:
   ```bash
   cd frontend
   # Configure frontend envs if necessary
   pnpm run dev
   ```

Your backend should now be running (typically on port `9000`) and your frontend on port `3000` (or `3030`, depending on your configuration).
