FROM node:latest

WORKDIR /usr/src/live-server

COPY package*.json ./

RUN npm i

COPY . .

EXPOSE 1935 8000

CMD ["node","app.js"]
