# Stage 1: Build
FROM node:22 AS build

WORKDIR /app/natipsy

# Copy package.json and package-lock.json (if present) for caching npm install
COPY ./package*.json ./

# Install dependencies (production only)
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Build the application
ARG NODE_ENV=production
ARG BUILD_TIMESTAMP
RUN echo "NODE_ENV is set to $NODE_ENV" # Print NODE_ENV
RUN npm run build

# Stage 2: Runtime
FROM node:22-alpine

WORKDIR /app

# Copy only the build files from the build stage
COPY --from=build /app/natipsy/dist /app/dist

# Create the entrypoint script
RUN echo '#!/bin/sh\n\
if [ -d "/app/dist" ]; then\n\
  echo "Files copied successfully"\n\
else\n\
  echo "Source directory does not exist"\n\
fi\n\
exec "$@"' > /docker-entrypoint.sh && chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]

# Default command to keep the container running
CMD ["sh", "-c", "while :; do sleep 2073600; done"]
