FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN addgroup -g 1001 -S finflow && adduser -S finflow -u 1001
COPY --from=builder --chown=finflow:finflow /app/.next/standalone ./
COPY --from=builder --chown=finflow:finflow /app/.next/static ./.next/static
COPY --from=builder --chown=finflow:finflow /app/public ./public
USER finflow
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
