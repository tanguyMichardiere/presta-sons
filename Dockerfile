FROM node:20 as BUILDER

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm clean-install

COPY tsconfig.json ./
COPY src src
RUN npm run build

# ----------------------------------------

FROM node:20-alpine

WORKDIR /usr/src/app
ENV NODE_ENV="production"

COPY package*.json ./
RUN npm clean-install --only=production

COPY --from=BUILDER /usr/src/app/dist dist

ENTRYPOINT ["node", "dist/index.js"]
