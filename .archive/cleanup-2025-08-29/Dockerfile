FROM node:23.3.0-slim AS builder

WORKDIR /app

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

RUN npm install -g bun@1.2.5 turbo@2.3.3

RUN ln -s /usr/bin/python3 /usr/bin/python

COPY package.json turbo.json tsconfig.json lerna.json renovate.json .npmrc ./
COPY scripts ./scripts
COPY packages ./packages

RUN SKIP_POSTINSTALL=1 bun install --no-cache

RUN bun run build

FROM node:23.3.0-slim AS runtime

WORKDIR /app

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

# Development stage with hot reload capabilities
FROM runtime AS development

ENV NODE_ENV=development
ENV LOG_LEVEL=debug

# Install development tools
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    vim \
    procps \
    htop && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Keep container running for development
CMD ["bun", "run", "dev"]
