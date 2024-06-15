FROM oven/bun AS builder

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

COPY src src
RUN bun run build



FROM gcr.io/distroless/base-debian12

COPY --from=builder /app/presta-sons /app/presta-sons

CMD ["/app/presta-sons"]
