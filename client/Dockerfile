FROM node:23-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production environment
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=build /app/build /usr/share/nginx/html

# Add nginx config for React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
