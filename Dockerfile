FROM node:lts
WORKDIR /app
COPY ./package.json ./
RUN npm i
RUN npm install -g nodemon
COPY . .
CMD ["npm", "start"]