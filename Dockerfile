FROM node:7.4.0
ADD . /code
WORKDIR /code
RUN npm install
CMD node libotrio.js
