FROM node:22-alpine3.19 as builder

WORKDIR /app

COPY package.json ./
COPY testconfig.json ./
COPY src ./src
COPY tools ./tools

RUN npm install --npm@latest
RUN npm ci && npm run build


FROM node:22-alpine3.19

WORKDIR /app

RUN apk add --no-cache curl

COPY package.json ./
COPY testconfig.json ./
COPY src ./src
RUN npm install -g pm2 && npm install npm@latest
RUN npm ci --production
COPY --from=builder /app/build ./build

EXPOSE 4004

CMD [ "npm", "run", "start" ]
