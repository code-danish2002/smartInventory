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

# copy all source files to the working directory
COPY --chown=node:node . .

# build the application
RUN npm run build

# ── 2) Production stage ────────────────────────────────────────
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*

# copy built assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# expose port 80
EXPOSE 80

# start nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
