FROM node:22.22.1-alpine

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

EXPOSE 9000

## For production

# CMD ["pnpm", "dev"]

# FROM node:22.22.1-alpine

# WORKDIR /app

# RUN corepack enable

# COPY package.json pnpm-lock.yaml ./

# RUN pnpm install --frozen-lockfile --prod

# COPY . .

# RUN pnpm build

# EXPOSE 9000

# CMD ["pnpm", "start"]