# Use official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy rest of the app
COPY . .

# Expose port (match your server.js, e.g., 3001)
EXPOSE 3001

# Start server
CMD [ "node", "server.js" ]
