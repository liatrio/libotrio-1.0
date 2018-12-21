FROM node:8.14.0-alpine
ADD . /code
WORKDIR /code
RUN npm install && npm install -g nodemon
CMD node libotrio.js
