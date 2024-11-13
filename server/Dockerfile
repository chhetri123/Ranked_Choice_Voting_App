FROM node:17.6.0-alpine

WORKDIR /app

COPY package*.json ./
COPY server/package*.json server/
COPY shared/package*.json shared/

RUN npm install

COPY server/ server/
COPY shared/ shared/

WORKDIR /app/server

ENV PORT=3000
ENV CLIENT_PORT=8080
ENV REDIS_HOST=redis
ENV REDIS_PORT=6379
ENV JWT_SECRET=super-secret
ENV POLL_DURATION=7200000

CMD ["npm", "run", "start:dev"] 