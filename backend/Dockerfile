
FROM node:20-slim AS builder


RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app


COPY package.json package-lock.json ./
COPY prisma ./prisma/


RUN npm ci


RUN npx prisma generate


COPY tsconfig.json ./
COPY src ./src/

RUN npx tsc

FROM node:20-slim AS runner


RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app


COPY package.json package-lock.json ./
COPY prisma ./prisma/

RUN npm ci 

RUN npx prisma generate


COPY --from=builder /app/dist ./dist/

RUN mkdir -p uploads

ENV PORT=4000
ENV NODE_ENV=production

EXPOSE 4000

CMD ["node", "dist/index.js"]
