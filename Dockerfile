FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY tsconfig.json ./

COPY src ./src

RUN npm run build

# Copy SQL migration files to the compiled output directory
RUN mkdir -p dist/migrations \
    && cp src/migrations/*.sql dist/migrations/

EXPOSE 8007

CMD ["node", "dist/server.js"]