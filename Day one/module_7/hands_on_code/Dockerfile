# Dockerfile for SDK Upload Relay Verification Environment
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src/ ./src/
COPY README.md ./

# Create a non-root user for security (or use existing user if UID 1000 exists)
RUN (id -u 1000 > /dev/null 2>&1 || useradd -m -u 1000 student) && \
    chown -R 1000:1000 /app || true

USER 1000

# Expose port if needed (not required for CLI tools, but good practice)
EXPOSE 3000

# Default command
CMD ["node", "--version"]

