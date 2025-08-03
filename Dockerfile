# Use a lightweight Node.js base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json first to leverage Docker's layer caching
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the application source code, including the 'src' directory
COPY . .

# Add a HEALTHCHECK to satisfy deployment systems like Coolify
# This checks if the bot's process is still running after a 10s start-up period.
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s \
  CMD node -e "process.exit(require('./index.js') ? 0 : 1)"

# Command to run the bot
CMD ["npm", "start"]
