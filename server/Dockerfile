FROM node:lts-alpine

WORKDIR /usr/src/app

COPY ["server/package.json", "server/package-lock.json*", "server/npm-shrinkwrap.json*", "./"]
RUN apt-get -y update
RUN apt-get -y upgrade
RUN apt-get install -y ffmpeg
RUN npm install --silent && mv node_modules ../

COPY . .

CMD ["npm", "run", "start"]