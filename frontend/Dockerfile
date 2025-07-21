# Install dependencies only when needed
FROM node:20-alpine AS deps
WORKDIR /src/app
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM node:20-alpine AS builder
WORKDIR /src/app
COPY --from=deps /src/app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image, copy all the files and start the app
FROM node:20-alpine AS runner
WORKDIR /src/app

ENV NODE_ENV production

COPY --from=builder /src/app/public ./public
COPY --from=builder /src/app/.next ./.next
COPY --from=builder /src/app/node_modules ./node_modules
COPY --from=builder /src/app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]
