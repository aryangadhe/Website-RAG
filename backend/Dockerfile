FROM node:22-bookworm-slim

# Install Python and pip
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Alias python to python3
RUN ln -s /usr/bin/python3 /usr/bin/python

# Create app directory
WORKDIR /usr/src/app

# Install Python dependencies for the crawler
RUN pip3 install --break-system-packages --no-cache-dir crawl4ai playwright
RUN playwright install --with-deps chromium

# Install Node dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy the rest of the application
COPY . .

# Expose port
EXPOSE 3000

# Start command
CMD ["npm", "start"]
