# Nginx Gateway Routing Configuration

## 1. Domain-Based Routing

The Nginx gateway in `infra/nginx/docker/gateway.conf.template` routes traffic based on the `Host` header:

```nginx
# User Frontend & Public Invitations
server {
    listen 8080;
    server_name ${USER_SERVER_NAME};

    # API routes to Spring Boot
    location /api/ {
        proxy_pass http://backend:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Telegram Webhook route
    location /webhook/telegram {
        proxy_pass http://telegram-bot:8000/webhook;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # User SPA static assets & client routing
    location / {
        proxy_pass http://frontend-user:8080/;
        proxy_set_header Host $host;
    }
}

# Admin Console
server {
    listen 8080;
    server_name ${ADMIN_SERVER_NAME};

    location /api/ {
        proxy_pass http://backend:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://frontend-admin:8080/;
        proxy_set_header Host $host;
    }
}
```

