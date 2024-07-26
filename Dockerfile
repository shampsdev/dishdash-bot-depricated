FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN --mount=type=secret,id=API_URL \
    --mount=type=secret,id=BOT_TOKEN \
    --mount=type=secret,id=BOT_URL \
    --mount=type=secret,id=BOT_USERNAME \
    --mount=type=secret,id=DEVELOP \
    --mount=type=secret,id=FRONTEND_URL \
    --mount=type=secret,id=HOST_URL \
    --mount=type=secret,id=PORT \
    sh -c 'echo API_URL=$(cat /run/secrets/API_URL) >> .env && \
           echo BOT_TOKEN=$(cat /run/secrets/BOT_TOKEN) >> .env && \
           echo BOT_URL=$(cat /run/secrets/BOT_URL) >> .env && \
           echo BOT_USERNAME=$(cat /run/secrets/BOT_USERNAME) >> .env && \
           echo DEVELOP=$(cat /run/secrets/DEVELOP) >> .env && \
           echo FRONTEND_URL=$(cat /run/secrets/FRONTEND_URL) >> .env && \
           echo HOST_URL=$(cat /run/secrets/HOST_URL) >> .env && \
           echo PORT=$(cat /run/secrets/PORT) >> .env'

CMD ["npm", "start"]
