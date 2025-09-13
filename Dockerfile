# ── 1) Build stage ───────────────────────────────────────────────
FROM node:18-alpine AS builder
WORKDIR /app

# accept a build-time API URL
ARG VITE_API_URL
# expose it to Vite’s build
ENV VITE_API_URL=${VITE_API_URL}

# install deps
COPY package.json package-lock.json* ./
# Change the ownership of the files to the 'node' user
RUN chown -R node:node /app
# Switch to the 'node' user before running npm ci to prevent permission errors
USER node
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
