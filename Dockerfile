# ── 1) Build stage ───────────────────────────────────────────────
FROM node:18-alpine AS builder
WORKDIR /app

# accept a build-time API URL
ARG VITE_API_URL
# expose it to Vite’s build
ENV VITE_API_URL=${VITE_API_URL}

# Switch to the 'node' user early
USER node

# install deps
# Use the --chown flag to copy files with the correct ownership
COPY --chown=node:node package.json package-lock.json* ./
RUN npm ci

# copy source & build
COPY --chown=node:node . .
RUN npm run build

# ── 2) Production stage ────────────────────────────────────────
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*

# copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
