FROM node:20-alpine

RUN corepack enable

WORKDIR /app

COPY package.json ./
COPY pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

EXPOSE 3000

RUN ["pnpm", "run", "start"]

# Define the command to run your application
