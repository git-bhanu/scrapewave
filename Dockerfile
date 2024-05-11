ARG NODE_VERSION=21.7
ARG ALPINE_VERSION=3.18

FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION}

WORKDIR /usr/src/app

ENV CHROME_BIN="/usr/bin/chromium-browser" \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"

RUN set -x \
    && apk update \
    && apk upgrade \
    && apk add --no-cache \
    udev \
    ttf-freefont \
    chromium

COPY package*.json ./

COPY . .

RUN npm ci && npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
