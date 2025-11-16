# your node version
FROM node:20-alpine AS deps-prod

WORKDIR /app

COPY ./package.json .

RUN npm install --omit=dev

FROM deps-prod AS build

RUN npm install --include=dev

COPY . .

RUN npm run build

FROM node:20-alpine AS prod

WORKDIR /app

COPY --from=build /app/package*.json .
COPY --from=deps-prod /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

RUN npm start

# Устанавливаем cron
RUN apk add --no-cache dcron

# Создаем скрипт для запуска
RUN echo '#!/bin/sh\ncd /app && /usr/local/bin/npm run export' > /export-app.sh && \
    chmod +x /export-app.sh

# Настраиваем cron для ежечасного запуска - ежеминутный для теста
RUN echo "* * * * * /export-app.sh >> /var/log/cron.log 2>&1" > /etc/crontab

# Создаем лог-файл и запускаем cron
RUN touch /var/log/cron.log

# Запускаем cron и основное приложение
CMD ["sh", "-c", "crond -f -l 8 & npm run start"]