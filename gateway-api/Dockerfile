# Use an official Node.js LTS image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose service port (change if needed)
EXPOSE 8181

# Run the app
CMD ["npm", "start"]
