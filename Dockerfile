# mates-fullstack example app — compiled production runtime

FROM node:20-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY mates-fullstack ./mates-fullstack
COPY dist ./dist

WORKDIR /app/mates-fullstack/example-app
RUN npm install
RUN npm run build

FROM node:20-slim AS runtime

WORKDIR /app/mates-fullstack/example-app
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/dist /app/dist
COPY --from=build /app/mates-fullstack/package.json /app/mates-fullstack/package.json
COPY --from=build /app/mates-fullstack/dist /app/mates-fullstack/dist
COPY --from=build /app/mates-fullstack/example-app/package.json ./package.json
COPY --from=build /app/mates-fullstack/example-app/node_modules ./node_modules
COPY --from=build /app/mates-fullstack/example-app/dist ./dist

# Production start uses dist/server/*.js, dist/assets, and dist/public.
CMD ["node", "../../dist/cli-new.js", "start"]
