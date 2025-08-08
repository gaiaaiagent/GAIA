FROM node:23.3.0-slim AS builder

WORKDIR /app

# Install system dependencies (rarely changes - cached)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    ffmpeg \
    g++ \
    git \
    make \
    python3 \
    unzip && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install global tools (rarely changes - cached)
RUN npm install -g bun@1.2.5 turbo@2.3.3

RUN ln -s /usr/bin/python3 /usr/bin/python

# Copy dependency files first (changes less frequently)
COPY package.json bun.lockb turbo.json tsconfig.json lerna.json renovate.json .npmrc ./

# Copy package.json files for all packages (for dependency resolution)
COPY packages/*/package.json ./packages-temp/

# Move package.json files to correct structure
RUN mkdir -p packages && \
    for dir in packages-temp/*; do \
        pkg=$(basename "$dir"); \
        mkdir -p "packages/${pkg%.json}" && \
        cp "$dir" "packages/${pkg%.json}/package.json"; \
    done && \
    rm -rf packages-temp

# Install dependencies (cached when dependencies don't change)
RUN SKIP_POSTINSTALL=1 bun install --frozen-lockfile --no-cache

# Copy source code (changes frequently - at the end)
COPY scripts ./scripts
COPY packages ./packages

# Build the application
RUN bun run build

# Production stage
FROM node:23.3.0-slim

WORKDIR /app

# Install runtime dependencies only
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    ffmpeg \
    git \
    python3 \
    unzip && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN npm install -g bun@1.2.5 turbo@2.3.3

# Copy built application from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/turbo.json ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/lerna.json ./
COPY --from=builder /app/renovate.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/scripts ./scripts

ENV NODE_ENV=production

EXPOSE 3000
EXPOSE 50000-50100/udp

CMD ["bun", "run", "start"]