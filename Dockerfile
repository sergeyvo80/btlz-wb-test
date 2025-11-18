# your node version
FROM node:20-alpine AS deps-prod

WORKDIR /app

COPY package.json ./

RUN npm install --omit=dev

FROM deps-prod AS build

RUN npm install --include=dev

ENV NODE_OPTIONS="--max-old-space-size=2048"

COPY . .
# COPY src ./src

RUN npm run build

FROM node:20-alpine AS prod

WORKDIR /app
# RUN npm run build

COPY --from=build /app/package*.json .
COPY --from=build /app/credentials.json .
COPY --from=deps-prod /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# Устанавливаем cron
RUN apk add --no-cache dcron

# Настраиваем cron: export и import - ежечасно
RUN printf "20 * * * * cd /app && npm run import >> /var/log/cron.log 2>&1\n25 * * * * cd /app && npm run export >> /var/log/cron.log 2>&1\n" > /etc/crontabs/root && \
    chmod 600 /etc/crontabs/root 

# Создаем лог-файл
RUN touch /var/log/cron.log

RUN crond -s reload 

# Запускаем cron и основное приложение
CMD ["sh", "-c", "crond -f -l 8 & npm run start"]