FROM python:3.12-alpine

WORKDIR /app

COPY ./samsung-tv-ws-api ./samsung-tv-ws-api
RUN pip install --no-cache-dir ./samsung-tv-ws-api aiohttp pillow

COPY ./main.py ./main.py
CMD ["python", "main.py"]
