# src/Dockerfile

# 1) Debian-slim + Python 3.12 (prebuilt wheels available up to 3.12)
FROM python:3.12-slim

# 2) no .pyc files, unbuffered stdout
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# 3) install system deps for Pillow, WeasyPrint, and wheel building
RUN apt-get update && apt-get install -y --no-install-recommends \
      build-essential \
      python3-dev \
      libffi-dev \
      libjpeg-dev \
      zlib1g-dev \
      libxml2-dev \
      libxslt1-dev \
      libpango1.0-dev \
      libgdk-pixbuf2.0-dev \
      libcairo2-dev \
      pkg-config \
      git \
    && rm -rf /var/lib/apt/lists/*

# 4) set working dir
WORKDIR /code

# 5) install Python deps (upgrade pip and wheel)
COPY requirements.txt /code/
RUN pip install --upgrade pip setuptools wheel \
 && pip install --no-cache-dir -r requirements.txt

# 6) copy project files (including db.sqlite3 & .env)
COPY . /code/

# 7) expose Django port
EXPOSE 8000

# 8) run migrations then serve via Gunicorn
CMD ["sh", "-c", "python manage.py migrate && gunicorn e_commerce_app.wsgi:application --bind 0.0.0.0:8000"]
