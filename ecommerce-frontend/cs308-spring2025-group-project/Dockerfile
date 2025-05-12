# 1) Build stage: Node.js on Alpine
FROM node:18-alpine AS build
WORKDIR /app

# Install dependencies and build the React app
COPY package.json package-lock.json ./
RUN npm ci --silent
COPY . .
RUN npm run build

# 2) Serve stage: Nginx
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

# Remove default static files
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from the build stage
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 and start Nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]