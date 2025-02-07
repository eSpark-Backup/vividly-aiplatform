FROM node:20.14.0
ENV NODE_ENV=Development

WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install && mv node_modules ../

COPY . .
RUN npm run build

CMD ["npm", "run", "preview"]