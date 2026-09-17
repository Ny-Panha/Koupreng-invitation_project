# syntax=docker/dockerfile:1.7
FROM node:22-alpine AS build
WORKDIR /workspace

COPY package.json package-lock.json ./
RUN npm ci
COPY . .

ARG VITE_API_URL=/api
ARG VITE_USER_APP_URL=http://localhost:8080
ENV VITE_API_URL=$VITE_API_URL \
    VITE_USER_APP_URL=$VITE_USER_APP_URL
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/dist /usr/share/nginx/html
EXPOSE 8080
