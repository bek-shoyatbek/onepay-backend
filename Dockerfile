FROM node:21

WORKDIR /app

COPY package*.json ./

COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npm run build

EXPOSE 6500

CMD ["node", "dist/main"]