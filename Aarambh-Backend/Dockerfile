# Multi-Stage Dockerfile for Enterprise Node.js Deployment (EC2/ECS)
FROM node:20-alpine AS base

# Working Directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy source code
COPY . .

# Environment Defaults
ENV PORT=5000 \
    NODE_ENV=production

# Expose port
EXPOSE 5000

# Use non-root node user for security
USER node

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/v1/health || exit 1

# Start Server
CMD ["node", "src/server.js"]
