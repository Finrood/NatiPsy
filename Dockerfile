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

# Create a script to copy files
RUN echo '#!/bin/sh\n\
if [ -d "/app/natipsy/dist" ]; then\n\
  cp -r /app/natipsy/dist/* /app/dist/\n\
  echo "Files copied successfully"\n\
else\n\
  echo "Source directory does not exist"\n\
fi\n\
exec "$@"' > /docker-entrypoint.sh && chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["sh", "-c", "while :; do sleep 2073600; done"]
