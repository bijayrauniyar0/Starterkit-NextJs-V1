# Fullstack Starter Kit - Backend

This is the backend service for the Fullstack Starter Kit, built with **Node.js**, **Express**, and **TypeScript**. It uses **PostgreSQL** (via Sequelize ORM) as the primary database and **Redis** for caching/sessions.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Cache/Session**: Redis
- **Containerization**: Docker & Docker Compose

## Prerequisites

Ensure you have the following installed on your local machine:
- **Node.js** (v18+ recommended)
- **pnpm** (or npm/yarn)
- **Docker** and **Docker Compose** (for running PostgreSQL and Redis)

## Getting Started

Follow these steps to set up and run the backend locally:

### 1. Install Dependencies
Navigate to the `backend` directory and install the required dependencies:
```bash
cd backend
pnpm install
```

### 2. Environment Variables
Create a `.env` file based on the provided sample:
```bash
cp .env.sample .env
```
Update the `.env` file with your specific configurations (e.g., database credentials, JWT secrets, email config, etc.).

### 3. Start Database and Redis
You can easily spin up the required PostgreSQL and Redis services using Docker Compose:
```bash
docker compose up --build
```

### 4. Run the Development Server
Once the database and Redis are running, start the development server:
```bash
pnpm run dev
```
The server will start at `http://localhost:9000` (or the port specified in your `.env`).

## Folder Structure

The backend follows a modular, feature-based architecture.

```text
backend/
├── src/
│   ├── @types/         # Custom TypeScript type definitions
│   ├── config/         # Configuration setups (Database, Redis, CORS, Google Auth)
│   ├── constants/      # App-wide constants and enums
│   ├── middlewares/    # Express middlewares (Authentication, Multer, etc.)
│   ├── modules/        # Feature-based modules (e.g., auth, user)
│   │   ├── auth/       # Auth controller, route, service
│   │   └── user/       # User controller, route, service, model
│   ├── templates/      # EJS templates (e.g., for email formatting)
│   ├── utils/          # Helper functions (JWT, Mailer, Pagination, etc.)
│   ├── index.ts        # Application entry point (Database connection & Server start)
│   └── server.ts       # Express app setup, middleware, and route registration
├── docker-compose.yml  # Docker services configuration
├── eslint.config.cjs   # ESLint configuration
├── tsconfig.json       # TypeScript configuration
└── package.json        # Dependencies and scripts
```

## Available Scripts

- `pnpm run dev`: Starts the application in development mode with live reloading (using `tsx watch`).
- `pnpm run build`: Compiles the TypeScript source code into JavaScript in the `dist/` directory.
- `pnpm run start`: Runs the compiled application from the `dist/` directory (used for production).

## Conventions to Follow

1. **Modular Architecture**: Keep features encapsulated. When creating a new feature, place its controller, route, service, and model inside its own directory within `src/modules/<feature_name>/`.
2. **Environment Variables**: Whenever you add a new environment variable to your `.env`, make sure to also add it to `.env.sample` with a dummy value.
3. **Type Safety**: Strictly define interfaces and types for request bodies, responses, and internal data structures. Avoid using `any`.
4. **Formatting & Linting**: The project is configured with ESLint and Prettier. Ensure your code is properly formatted before committing (`.lintstagedrc` is set up to help with this).
5. **Error Handling**: Use consistent error handling across all endpoints. Ensure async functions in controllers use `try-catch` blocks and pass errors to the global error handler or respond with appropriate HTTP status codes.
6. **Imports**: Prefer relative imports for modules within the same feature, and standard paths for shared utilities or configs.
