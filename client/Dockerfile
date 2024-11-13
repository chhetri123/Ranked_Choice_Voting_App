FROM node:17.6.0-alpine

WORKDIR /app

COPY package*.json ./
COPY client/package*.json client/
COPY shared/package*.json shared/

RUN npm install

COPY client/ client/
COPY shared/ shared/

WORKDIR /app/client

ENV VITE_API_HOST=localhost
ENV VITE_API_PORT=3000
ENV VITE_POLLS_NAMESPACE=polls

CMD ["npm", "run", "dev"] 