# Use Python 3.8 image
FROM python:3.8-slim


# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    vim \
    build-essential \
    && apt-get clean

# Set the working directory
WORKDIR /app

# Copy requirements file and install dependencies
RUN pip install --upgrade pip
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt


# Copy the project code into the container
COPY . .

# Set up the Django environment
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Expose port 8000 for Django
EXPOSE 8000

# Add working directory to safe directory to git
RUN git config --global --add safe.directory /app

# Default command
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
