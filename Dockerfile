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

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD node -e "require('http').get('http://127.0.0.1:8007/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

EXPOSE 8007

CMD ["node", "dist/scripts/start.js"]