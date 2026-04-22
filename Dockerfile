FROM python:3.11-slim

WORKDIR /Align42

COPY . .

RUN pip install --no-cache-dir flask

EXPOSE 3000

CMD ["python", "server.py"]
