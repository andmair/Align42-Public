FROM python:3.12-slim

WORKDIR /app

# Keep runtime deterministic and logs unbuffered.
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=3000

# Copy only the files required to serve the local-first app.
COPY Align42.html app.js styles.css standards.html logo-align42.svg README.md server.py ./

EXPOSE 3000

CMD ["python3", "server.py"]
