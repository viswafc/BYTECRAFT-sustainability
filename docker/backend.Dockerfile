FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1
WORKDIR /app

COPY requirements.txt pyproject.toml ./
RUN pip install -r requirements.txt

COPY ml ./ml
COPY backend ./backend
COPY database ./database
COPY data/raw ./data/raw

# Train the baseline models at build time so the image is self-contained (~10 s).
RUN python -m ml.training.train --no-reports

EXPOSE 8000
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
