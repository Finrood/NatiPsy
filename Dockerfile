# Build stage
FROM node:22-alpine AS build

WORKDIR .

# Copy package files and install all dependencies (including devDependencies)
COPY ./package*.json ./
RUN npm ci --only=production --silent || npm install --silent

# Copy source and build
COPY natipsy-app .

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Build the application
RUN echo "Building with NODE_ENV=${NODE_ENV}" && \
    npm run build -- --configuration=${NODE_ENV} && \
    mkdir -p /app/dist && \
    if [ -d "dist/natipsy-app/browser" ]; then \
        cp -r dist/natipsy-app/browser/* /app/dist/; \
    elif [ -d "dist" ]; then \
        cp -r dist/* /app/dist/; \
    else \
        echo "Error: No build output found" && exit 1; \
    fi

# Final stage (minimal runtime to populate volume)
FROM alpine:3.20

WORKDIR /app

# Copy built assets
COPY --from=build --chown=1000:1000 /app/dist /app/dist

# Use a non-root user (uid/gid 1000 for consistency)
RUN addgroup -g 1000 -S appgroup && \
    adduser -u 1000 -S appuser -G appgroup

USER appuser

# Keep container running to populate the volume
CMD ["tail", "-f", "/dev/null"]
