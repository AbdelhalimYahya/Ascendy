FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
RUN npm ci --workspace=apps/backend --no-audit --no-fund || npm install --workspace=apps/backend --no-audit --no-fund
COPY apps/backend ./apps/backend
WORKDIR /app/apps/backend
RUN npx prisma generate --schema=prisma/schema.prisma
RUN npm run build

FROM node:20-alpine
WORKDIR /app/apps/backend
ENV NODE_ENV=production
COPY --from=build /app/apps/backend/dist ./dist
COPY --from=build /app/apps/backend/package.json ./
COPY --from=build /app/apps/backend/prisma ./prisma
RUN npm install --omit=dev --no-audit --no-fund && npx prisma generate --schema=prisma/schema.prisma
EXPOSE 3000
CMD ["node", "dist/main.js"]
