FROM python:3.11-slim

# Security: Set non-interactive and UTF-8
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000 \
    HOST=0.0.0.0 \
    LANG=C.UTF-8 \
    PYTHONIOENCODING=utf-8

WORKDIR /app

# Create non-root user for security
RUN groupadd --system app && \
    useradd --system --gid app --no-create-home app

# Install ca-certificates
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Copy only application files needed at runtime
COPY --chown=app:app Align42.html \
                      app.js \
                      styles.css \
                      standards.html \
                      logo-align42.svg \
                      server.py \
                      align42_core.py \
                      align42_adapters.py \
                      validation.py \
                      logging_config.py \
                      rate_limiting.py \
                      health_check.py \
                      ./

# Create logs directory with proper permissions
RUN mkdir -p logs && chown app:app logs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python3 -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health', timeout=5).read()" || exit 1

# Switch to non-root user
USER app

# Expose port
EXPOSE 8000

# Run application
CMD ["python3", "server.py"]
