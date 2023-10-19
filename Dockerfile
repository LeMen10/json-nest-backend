FROM node:18-alpine

EXPOSE 9000

WORKDIR /app

RUN npm i npm@latest -g

COPY package.json package-lock.json ./

RUN npm install

COPY . .

CMD ["node", "src/index.js"]