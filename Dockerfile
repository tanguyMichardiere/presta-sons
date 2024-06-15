FROM oven/bun AS builder

WORKDIR /usr/src/app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

COPY src src
RUN bun run build



FROM scratch

COPY --from=builder /usr/src/app/presta-sons /presta-sons

CMD ["/presta-sons"]
