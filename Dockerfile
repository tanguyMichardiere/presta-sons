FROM oven/bun:alpine AS builder

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

COPY src src
RUN bun run build



FROM alpine

COPY --from=builder /app/presta-sons /app/presta-sons

ENTRYPOINT ["/app/presta-sons"]
