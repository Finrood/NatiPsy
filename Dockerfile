# =================================================================
# Build Stage
# This stage uses a full Node.js environment to build the Angular application.
# =================================================================
FROM node:22-alpine AS build

WORKDIR /app

# Copy package files and install dependencies. This layer is cached
# and will only be re-run if package*.json files change.
COPY package*.json ./
RUN npm ci

# Copy the rest of the application source code.
COPY . .

# Set build arguments for production builds.
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Run the build command. This will create the final artifacts in
# the default Angular output directory: '/app/dist/natipsy'.
# We no longer need the complex shell script to move files around.
RUN npm run build -- --configuration=${NODE_ENV}


# =================================================================
# Final Stage
# This stage creates a minimal image containing only the built artifacts.
# Its only purpose is to populate the Docker named volume.
# =================================================================
FROM alpine:3.20

# Copy the *contents* of the build output directory from the 'build' stage
# into this image's '/app/dist' directory.
#
# The trailing slash on the source path '/app/dist/natipsy/' is CRITICAL.
# It tells Docker to copy the contents of the directory, not the directory itself.
COPY --from=build --chown=1000:1000 /app/dist/natipsy/ /app/dist/

# Create a non-root user for security best practices.
RUN addgroup -g 1000 -S appgroup && \
    adduser -u 1000 -S appuser -G appgroup

USER appuser

# This command does nothing except keep the container running.
# This is necessary for Docker Compose to copy the files from the container
# into the named volume when the service first starts.
CMD ["tail", "-f", "/dev/null"]
