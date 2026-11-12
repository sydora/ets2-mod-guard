FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install production dependencies
RUN npm install --production

# Copy application source code
COPY . .

# Ensure storage directories exist
RUN mkdir -p storage/mods

# Expose server port (default 5000)
EXPOSE 5000

# Environment variables
ENV PORT=5000
ENV NODE_ENV=production

# Start the cloud distribution server
CMD ["node", "server.js"]
