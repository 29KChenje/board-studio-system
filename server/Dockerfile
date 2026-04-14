FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
COPY client/package.json ./client/package.json
COPY server/package.json ./server/package.json
RUN npm install

COPY client ./client
COPY server ./server
COPY uploads ./uploads

RUN npm run build --workspace client

FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
COPY server/package.json ./server/package.json
RUN npm install --omit=dev --workspace server

COPY server ./server
COPY uploads ./uploads
COPY --from=build /app/client/dist ./client/dist

WORKDIR /app/server
EXPOSE 5000
CMD ["npm", "run", "start"]
