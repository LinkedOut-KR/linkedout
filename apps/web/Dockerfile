FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY package.json ./
RUN pnpm install
COPY . .
RUN pnpm build

FROM node:20-alpine
WORKDIR /app
RUN npm install -g pnpm
COPY package.json ./
RUN pnpm install --prod
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["pnpm", "start"]
