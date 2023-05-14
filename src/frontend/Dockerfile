FROM node:18-alpine
WORKDIR /
COPY . .
RUN npm i
CMD [ "node", "build/index.js" ]
EXPOSE 3000