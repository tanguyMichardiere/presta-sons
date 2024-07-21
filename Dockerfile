FROM oven/bun AS builder

WORKDIR /home/bun/app

COPY package.json bun.lockb ./
COPY patches patches
RUN bun install --frozen-lockfile

COPY src src
RUN bun run build



FROM gcr.io/distroless/base-debian12

ENV NODE_ENV="production"

COPY --from=builder /home/bun/app/presta-sons /presta-sons

CMD ["/presta-sons"]
