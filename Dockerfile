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

# The critical COPY command pointing to the correct source
COPY --from=build /app/dist/nati-psy/browser/ /app/dist/

# This command just keeps the container alive.
CMD ["tail", "-f", "/dev/null"]
