FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3001

RUN chmod +x wait-for.sh

CMD sh -c "./wait-for.sh postgres:5432 --timeout=60 -- ./wait-for.sh kafka:9092 --timeout=60 -- node server.js"

