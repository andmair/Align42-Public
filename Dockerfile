FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PORT=3000

RUN addgroup --system align42 && adduser --system --ingroup align42 align42

COPY Align42.html app.js styles.css standards.html logo-align42.svg README.md server.py ./

RUN chown -R align42:align42 /app

USER align42

EXPOSE 3000

CMD ["python", "server.py"]
