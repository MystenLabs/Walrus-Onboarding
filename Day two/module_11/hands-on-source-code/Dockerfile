FROM node:20-slim

WORKDIR /app

# Install dependencies first for better caching
COPY package.json package-lock.json* ./
RUN npm install

# Copy source code
COPY . .

# Default command
CMD ["npm", "test"]





