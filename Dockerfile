FROM node:alpine

WORKDIR /usr/src/live-server

COPY package.json *.lock ./

RUN yarn --registry=https://registry.npm.taobao.org

COPY . .

EXPOSE 1935 8000

CMD ["yarn","start"]
