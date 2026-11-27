FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    coinor-cbc \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY ./backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt

COPY .env .
COPY ./backend/v2 ./v2

CMD ["fastapi", "run", "v2/cmd/main.py", "--port", "8000"]