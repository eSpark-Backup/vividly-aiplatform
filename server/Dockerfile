FROM node:lts-alpine

WORKDIR /

COPY ["server/package.json", "server/package-lock.json*", "server/npm-shrinkwrap.json*", "./"]
RUN npm install --silent && mv node_modules ../

COPY . .

CMD ["npm", "run", "start"]