# syntax=docker/dockerfile:1.7
FROM node:22-alpine AS build
WORKDIR /workspace

COPY package.json package-lock.json ./
RUN npm ci
COPY . .

ARG VITE_API_URL=/api
ARG VITE_PUBLIC_APP_URL=
ARG VITE_GOOGLE_CLIENT_ID=
ARG VITE_TELEGRAM_BOT_USERNAME=
ARG VITE_TELEGRAM_BOT_ID=
ARG VITE_TELEGRAM_CLIENT_ID=
ENV VITE_API_URL=$VITE_API_URL \
    VITE_PUBLIC_APP_URL=$VITE_PUBLIC_APP_URL \
    VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID \
    VITE_TELEGRAM_BOT_USERNAME=$VITE_TELEGRAM_BOT_USERNAME \
    VITE_TELEGRAM_BOT_ID=$VITE_TELEGRAM_BOT_ID \
    VITE_TELEGRAM_CLIENT_ID=$VITE_TELEGRAM_CLIENT_ID
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/dist /usr/share/nginx/html
EXPOSE 8080
