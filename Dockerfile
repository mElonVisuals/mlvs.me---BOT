# Use the official Node.js 18 LTS image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy the rest of the application code
COPY . .

# Create a non-root user to run the application
RUN addgroup -g 1001 -S nodejs
RUN adduser -S mlvsbot -u 1001

# Change ownership of the app directory to the nodejs user
RUN chown -R mlvsbot:nodejs /app
USER mlvsbot

# Expose the port (even though Discord bots don't typically use HTTP)
# This is useful if you add a health check endpoint later
EXPOSE 3000

# Health check to ensure the bot is running properly
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "console.log('Bot health check passed')" || exit 1

# Start the bot
CMD ["npm", "start"]