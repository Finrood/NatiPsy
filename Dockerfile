# =================================================================
# Build Stage
# =================================================================
FROM node:22.22.3-alpine3.22@sha256:cd7807368cf24826297cbad5dca1a44972ccfd770647db52a8c7589eb4599ac8 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install --global npm@10.9.9 --no-audit --no-fund \
    && test "$(npm --version)" = "10.9.9" \
    && npm ci --ignore-scripts --no-audit --no-fund

COPY . .

# Build output path is /app/dist/nati-psy/browser
RUN npm run build -- --configuration=production

# =================================================================
# Final Stage - Serving with Nginx
# =================================================================
FROM nginxinc/nginx-unprivileged:1.27.5-alpine@sha256:65e3e85dbaed8ba248841d9d58a899b6197106c23cb0ff1a132b7bfe0547e4c0

# Copy built static files to Nginx's default directory
COPY --from=build /app/dist/nati-psy/browser/ /usr/share/nginx/html/
COPY nginx-security-headers.conf /etc/nginx/security-headers.conf

# Copy custom Nginx config for Angular routing
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx-security-headers.conf /etc/nginx/snippets/natipsy-security-headers.conf

USER 101:101
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/index.html >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
