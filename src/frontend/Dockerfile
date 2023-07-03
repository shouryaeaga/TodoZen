FROM node:18-alpine
WORKDIR /
COPY . .
RUN npm i
RUN npm run build
CMD [ "node", "build/index.js" ]
EXPOSE 3000
