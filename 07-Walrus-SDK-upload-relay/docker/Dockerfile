# Dockerfile for SDK Upload Relay Module Hands-On Exercises
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files from hands-on-source-code
COPY hands-on-source-code/package*.json ./
COPY hands-on-source-code/tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY hands-on-source-code/src/ ./src/
COPY hands-on-source-code/README.md ./

# Create a non-root user for security (or use existing user if UID 1000 exists)
RUN (id -u 1000 > /dev/null 2>&1 || useradd -m -u 1000 student) && \
    chown -R 1000:1000 /app || true

USER 1000

# Default command
CMD ["node", "--version"]

