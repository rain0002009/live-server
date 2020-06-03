FROM alpine:latest AS builder

WORKDIR /usr/src/live-server

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories \
 && apk add --no-cache --update nodejs yarn

COPY package.json yarn.lock ./

RUN yarn

FROM alpine:latest

WORKDIR /usr/src/live-server

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories \
 && apk add --no-cache --update nodejs yarn ffmpeg

COPY --from=builder /usr/src/live-server/node_modules ./node_modules

COPY . .

EXPOSE 1935 8000

CMD ["node", "index.js"]
