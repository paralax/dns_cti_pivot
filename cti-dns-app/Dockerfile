# Stage 1: Build the React application
FROM node:18-slim AS build

WORKDIR /app

# Add a build argument for the Google Client ID
ARG REACT_APP_GOOGLE_CLIENT_ID
ENV REACT_APP_GOOGLE_CLIENT_ID=$REACT_APP_GOOGLE_CLIENT_ID

COPY cti-dns-app/package*.json ./

RUN npm install

COPY cti-dns-app/ ./

RUN npm run build

# Stage 2: Serve the application from Nginx
FROM nginx:stable-alpine

COPY --from=build /app/build /usr/share/nginx/html

# When a user hits refresh, the browser sends a request to the server.
# Nginx needs to be configured to always serve index.html for client-side routing to work.
RUN rm /etc/nginx/conf.d/default.conf
COPY cti-dns-app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
