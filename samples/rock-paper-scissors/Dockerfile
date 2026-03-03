# Multi-stage build for rock-paper-scissors Squad SDK sample

FROM node:20-alpine AS builder

WORKDIR /build

# Copy package files
COPY packages/squad-sdk/package.json packages/squad-sdk/
COPY samples/rock-paper-scissors/package.json samples/rock-paper-scissors/

# Copy SDK source and built dist
COPY packages/squad-sdk/dist packages/squad-sdk/dist
COPY packages/squad-sdk/node_modules packages/squad-sdk/node_modules

# Copy the sample source (index.ts + prompts.ts)
COPY samples/rock-paper-scissors/tsconfig.json samples/rock-paper-scissors/
COPY samples/rock-paper-scissors/index.ts samples/rock-paper-scissors/
COPY samples/rock-paper-scissors/prompts.ts samples/rock-paper-scissors/

# Install sample dependencies (resolves to local SDK)
WORKDIR /build/samples/rock-paper-scissors
RUN npm install

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy everything needed
COPY --from=builder /build/samples/rock-paper-scissors /app
COPY --from=builder /build/packages/squad-sdk /packages/squad-sdk

CMD ["npx", "tsx", "index.ts"]
