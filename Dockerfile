# Build stage
FROM node:18-alpine as builder

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm i

# Copy source code
COPY . .

# Production stage
FROM node:18-alpine

# Install necessary production packages
RUN apk add --no-cache tini

# Create app directory
WORKDIR /usr/src/app

# Create a non-root user
RUN addgroup -g 1001 nodejs && \
    adduser -S -u 1001 -G nodejs nodejs

# Copy built assets from builder
COPY --from=builder --chown=nodejs:nodejs /usr/src/app/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /usr/src/app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /usr/src/app/src ./src
COPY --from=builder --chown=nodejs:nodejs /usr/src/app/logs ./logs

# Create necessary directories with correct permissions
RUN mkdir -p logs && chown -R nodejs:nodejs logs

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 8082

# Start the application
CMD ["node", "src/index.js"] 