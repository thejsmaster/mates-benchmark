# mates-fullstack benchmark app — production Docker build
# Generates the dist directory inside the build (no pre-built dist needed).

FROM node:20-slim AS build

WORKDIR /app

# Install dependencies from npm (package.json uses mates and mates-fullstack from npm)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy source files
COPY . .

# Build the app (generates dist/ internally)
RUN npm run build

# ── Runtime stage ──────────────────────────────────────────────────────────────
FROM node:20-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Copy only what's needed at runtime
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/client ./client
COPY --from=build /app/server ./server
COPY --from=build /app/shared ./shared
COPY --from=build /app/public ./public
COPY --from=build /app/mates.config.ts ./

# Production start uses the CLI built into node_modules
CMD ["node", "node_modules/.bin/mates-fullstack", "start"]
