# Dockerfile for Performance Optimization Hands-On Lab
FROM node:20-slim

WORKDIR /app

# Copy package files from hands-on-source-code
COPY package.json package-lock.json* ./
RUN npm install

# Copy TypeScript source
COPY ts/ ./ts/
COPY tsconfig.json ./

# Create a non-root user for security
RUN useradd -m -u 1000 -s /bin/bash student 2>/dev/null || true && \
    chown -R 1000:1000 /app

USER 1000

# Default command
CMD ["npm", "start"]
