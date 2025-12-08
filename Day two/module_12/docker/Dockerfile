# Dockerfile for Failure Handling Module Hands-On Exercises
FROM node:20-slim

WORKDIR /app

# Copy package files from hands-on-source-code
COPY hands-on-source-code/package*.json ./
COPY hands-on-source-code/tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY hands-on-source-code/ts/ ./ts/

# Create a non-root user for security
RUN (id -u 1000 > /dev/null 2>&1 || useradd -m -u 1000 student) && \
    chown -R 1000:1000 /app || true

USER 1000

CMD ["node", "--version"]

