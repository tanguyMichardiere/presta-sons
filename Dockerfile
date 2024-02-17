FROM oven/bun:alpine
ENV NODE_ENV="production"
WORKDIR /usr/src/app

COPY package.json bun.lockb ./
RUN bun install --production --frozen-lockfile

COPY src src
ENTRYPOINT ["bun", "run", "start"]
