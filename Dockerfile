# Stage 1: Build with a lighter node image
FROM node:22-slim AS build

WORKDIR /app/natipsy

# Copy only package files first
COPY package*.json ./

# Install dependencies with specific optimizations
RUN npm install \
    && npm cache clean --force

# Copy only necessary source files
COPY src/ ./src/
COPY tsconfig*.json ./

# Build with optimizations
ARG NODE_ENV=production
RUN npm run build \
    && npm prune --production

# Stage 2: Runtime with minimal image
FROM node:22-alpine AS runtime

# Add curl for healthcheck but remove after installation
RUN apk add --no-cache --virtual .healthcheck-deps curl \
    && apk del .healthcheck-deps

# Create non-root user
RUN addgroup -S nodeapp && adduser -S nodeapp -G nodeapp

WORKDIR /app

# Copy only production dependencies and built files
COPY --from=build /app/natipsy/dist ./dist
COPY --from=build /app/natipsy/node_modules ./node_modules

# Set proper permissions
RUN chown -R nodeapp:nodeapp /app

# Use non-root user
USER nodeapp

# Reduce memory usage with these environment variables
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=512 --optimize-for-size"

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').request({ host: 'localhost', port: process.env.PORT || 3000, path: '/health', timeout: 2000 }, (res) => process.exit(res.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1)).end()"

# Start application
CMD ["node", "--optimize-for-size", "--gc-interval=100", "dist/main.js"]