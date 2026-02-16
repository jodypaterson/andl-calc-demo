# =============================================================================
# PRODUCTION DOCKERFILE - ANDL Demo Calculator
# Multi-stage build for optimized client application deployment
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Dependencies
# Install all dependencies needed for building
# -----------------------------------------------------------------------------
FROM node:20-alpine AS deps

# Install corepack for pnpm support
RUN corepack enable

WORKDIR /app

# Copy package files for dependency installation
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/client/package.json ./packages/client/

# Future: Uncomment when server package exists
# COPY packages/server/package.json ./packages/server/

# Install dependencies with frozen lockfile for reproducibility
RUN pnpm install --frozen-lockfile

# -----------------------------------------------------------------------------
# Stage 2: Builder
# Build the application
# -----------------------------------------------------------------------------
FROM deps AS builder

WORKDIR /app

# Copy source code for client package
COPY packages/client ./packages/client

# Future: Uncomment when server package exists
# COPY packages/server ./packages/server

# Build the client application
RUN pnpm --filter @andl-demo/client build

# Future: Uncomment when server package exists
# RUN pnpm --filter @andl-demo/server build

# -----------------------------------------------------------------------------
# Stage 3: Production
# Serve the built static files with nginx
# -----------------------------------------------------------------------------
FROM nginx:alpine AS production

# Copy built static files from builder stage
COPY --from=builder /app/packages/client/dist /usr/share/nginx/html

# Expose port 80 for HTTP traffic
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
