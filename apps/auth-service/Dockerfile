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
COPY --from=builder /app/dist ./dist
EXPOSE 4001
CMD ["node", "dist/main"]
