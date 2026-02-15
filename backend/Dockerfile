# Use an official lightweight Python image.
# https://hub.docker.com/_/python
FROM python:3.9-slim

# Set environment variables to prevent Python from writing pyc files to disc
# and to ensure stdout and stderr are unbuffered.
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set the working directory in the container.
WORKDIR /app

# Install system dependencies required for potential native extensions.
# build-essential is often needed for compiling Python packages.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the container.
COPY requirements.txt .

# Install Python dependencies.
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Copy the rest of the application code.
COPY . .

# Expose port 8000 for the application.
EXPOSE 8000

# Run the application using uvicorn.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
