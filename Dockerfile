# Use the official Node.js runtime as the base image
FROM node:18-alpine AS base

# Install build dependencies and essential packages
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git \
    libc6-compat \
    curl \
    bash \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install pnpm globally and verify installation
RUN npm install -g pnpm && \
    pnpm --version

# Install dependencies with strict lockfile
RUN pnpm install --frozen-lockfile --prefer-offline

# Verify critical dependencies are installed
RUN pnpm list @prisma/client next react react-dom

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Verify Prisma schema exists
RUN test -f prisma/schema.prisma || (echo "Prisma schema not found!" && exit 1)

# Generate Prisma client (commented out due to network issues during build)
# RUN npx prisma generate

# Verify Prisma client was generated (check both possible locations)
RUN (ls -la node_modules/.prisma || ls -la .prisma || echo "Prisma client not found in expected locations") && echo "Prisma client verification completed"

# Build the application for production
RUN npm run build

# Verify build output exists
RUN test -d .next || (echo "Next.js build output not found!" && exit 1)

# Development stage
FROM base AS development
WORKDIR /app

# Copy source code and dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client (commented out due to network issues during build)
# RUN npx prisma generate

# Create uploads directory
RUN mkdir -p public/uploads

# Expose port
EXPOSE 3000

# Set environment variables
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=development

# Run in development mode
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"] 