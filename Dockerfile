FROM oven/bun:distroless
ENV NODE_ENV="production"
WORKDIR /usr/src/app

COPY package.json bun.lockb ./
RUN bun install --production --frozen-lockfile

COPY . .
ENTRYPOINT ["bun", "start"]
