FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env ./
# SQLite db will reside in /app/data
RUN mkdir -p /app/data

EXPOSE 5000

ENV PORT=5000
ENV DATABASE_URL=./data/lerou_ecommerce.db

CMD ["node", "dist/server.js"]
