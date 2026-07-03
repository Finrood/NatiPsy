# =================================================================
# Build Stage
# =================================================================
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build output path is /app/dist/nati-psy/browser
RUN npm run build -- --configuration=production

# =================================================================
# Final Stage - Serving with Nginx
# =================================================================
FROM nginx:1.27-alpine

# Copy built static files to Nginx's default directory
COPY --from=build /app/dist/nati-psy/browser/ /usr/share/nginx/html/

# Copy custom Nginx config for Angular routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
