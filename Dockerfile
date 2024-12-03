FROM node:20.13.1-alpine

WORKDIR /app

COPY /package*.json .

RUN ls -la

RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 8001

CMD ["npm", "start"]
