# =================================================================
# Build Stage
# =================================================================
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# We discovered the output path is /app/dist/nati-psy/browser
RUN npm run build -- --configuration=production

# =================================================================
# Final Stage - The "Data Populator"
# =================================================================
FROM alpine:3.20

WORKDIR /app

# Copy built assets
COPY --from=build /app/dist/nati-psy/browser/ /app/dist/

# Use a non-root user (uid/gid 1000 for consistency)
RUN addgroup -g 1000 -S appgroup && \
    adduser -u 1000 -S appuser -G appgroup

USER appuser

# This command just keeps the container alive.
CMD ["tail", "-f", "/dev/null"]
