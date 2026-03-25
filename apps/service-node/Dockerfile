FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN addgroup -g 1001 -S finflow && adduser -S finflow -u 1001
COPY --from=builder --chown=finflow:finflow /app/dist ./dist
COPY --from=builder --chown=finflow:finflow /app/node_modules ./node_modules
COPY --from=builder --chown=finflow:finflow /app/package.json ./
USER finflow
EXPOSE 4000
HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
  CMD wget -q --spider http://localhost:4000/health || exit 1
CMD ["node", "dist/server.js"]
