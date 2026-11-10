FROM python:3.14

WORKDIR /app

COPY ./backend/requirements.txt /app/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt

COPY .env .

COPY ./backend/v2 ./v2

CMD ["fastapi", "run", "v2/cmd/main.py", "--port", "80"]