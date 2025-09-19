# Build stage
FROM node:22-alpine AS build

WORKDIR /app

# Copy package files and install dependencies (including devDependencies for build)
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Build the application and prepare dist
RUN npm run build -- --configuration=${NODE_ENV} && \
    mkdir -p dist && \
    if [ -d "dist/browser" ]; then \
        cp -r dist/browser/* dist/; \
    elif [ -d "dist" ]; then \
        :; \
    else \
        echo "Error: No build output found" && exit 1; \
    fi

# Final stage (minimal runtime to populate volume)
FROM alpine:3.20

WORKDIR /app

# Copy built assets with ownership (using absolute path for reliability)
COPY --from=build --chown=1000:1000 /app/dist /app/dist

# Create non-root user (uid/gid 1000 for consistency)
RUN addgroup -g 1000 -S appgroup && \
    adduser -u 1000 -S appuser -G appgroup

USER appuser

# Keep container running to populate the volume
CMD ["tail", "-f", "/dev/null"]
