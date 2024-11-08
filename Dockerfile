# Build stage
FROM node:18-alpine as builder

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Create logs directory with correct permissions in the builder stage
RUN mkdir -p logs

# Production stage
FROM node:18-alpine

# Install tini for managing processes
RUN apk add --no-cache tini

# Set working directory
WORKDIR /usr/src/app

# Create a non-root user for security
RUN addgroup -g 1001 nodejs && \
    adduser -S -u 1001 -G nodejs nodejs

# Copy built assets from builder
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/src ./src
COPY --from=builder /usr/src/app/logs ./logs

# Ensure the logs directory has the correct ownership
RUN chown -R nodejs:nodejs /usr/src/app/logs

# Switch to the non-root user
USER nodejs

# Expose the application port
EXPOSE 8082

# Use tini to start the application
ENTRYPOINT ["/sbin/tini", "--"]

# Start the application
CMD ["node", "src/index.js"]
