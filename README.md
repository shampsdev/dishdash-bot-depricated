# Bot

## How to use image?

Example `docker-compose.yaml`
```
version: '3'

services:
  dishdash-bot:
    image: shampiniony/dishdash-bot:latest
    environment:
      - API_URL=${API_URL}
      - BOT_TOKEN=${BOT_TOKEN}
      - BOT_URL=${BOT_URL}
      - BOT_USERNAME=${BOT_USERNAME}
      - DEVELOP=${DEVELOP}
      - FRONTEND_URL=${FRONTEND_URL}
      - HOST_URL=${HOST_URL}
      - PORT=${PORT}

```