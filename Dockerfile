FROM node:22 AS build
WORKDIR /app/natipsy

COPY ./package*.json ./
RUN npm install

COPY . .

# Build the application
ARG NODE_ENV=production
ARG BUILD_TIMESTAMP
RUN echo "NODE_ENV is set to $NODE_ENV" # Print NODE_ENV
RUN npm run build

# Stage 2: Clean up and prepare for volume mount (no need to install nginx)
FROM node:22 AS cleanup

WORKDIR /app/natipsy

# Copy only the necessary built artifacts (dist folder)
COPY --from=build /app/natipsy/dist /app/dist

# Set the entrypoint to ensure it doesn't start a server (as Nginx will serve the files)
CMD ["sh", "-c", "while :; do sleep 2073600; done"]
