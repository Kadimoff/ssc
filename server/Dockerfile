FROM oven/bun:1-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN bun install --production
COPY tsconfig.json drizzle.config.ts ./
COPY drizzle ./drizzle
COPY src ./src
EXPOSE 3443
CMD ["sh", "-c", "bun src/migrate.ts && bun src/seed.ts && bun src/index.ts"]
