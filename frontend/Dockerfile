# Build stage
FROM node:20-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage: serve with nginx
FROM nginx:alpine

# Copy built React app to nginx html directory
COPY --from=build /usr/src/app/build /usr/share/nginx/html

# (Optional) Custom nginx config for React Router, etc.
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
