# syntax=docker/dockerfile:1.7
FROM python:3.13-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1
WORKDIR /app

RUN groupadd --system koupreng \
    && useradd --system --gid koupreng --home-dir /app koupreng
COPY requirements.txt ./
RUN python -m pip install --disable-pip-version-check -r requirements.txt
COPY --chown=koupreng:koupreng main.py ./

USER koupreng
EXPOSE 8000
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers", "--forwarded-allow-ips=*"]
