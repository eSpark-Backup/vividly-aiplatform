FROM node:lts-alpine

WORKDIR /usr/src/app

COPY ["server/package.json", "server/package-lock.json*", "server/npm-shrinkwrap.json*", "./"]
RUN apk update
RUN apk upgrade
RUN apk add --no-cache ffmpeg
RUN npm install --silent && mv node_modules ../

COPY . .

CMD ["npm", "run", "start"]