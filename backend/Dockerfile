# Use the official Microsoft Playwright image that includes Node.js and native dependencies
FROM mcr.microsoft.com/playwright:v1.45.0-jammy

# Set working directory inside the container
WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install application dependencies
RUN npm ci

# Ensure the exact Chromium version matching the installed Playwright version is downloaded
RUN npx playwright install chromium

# Copy the rest of the application files
COPY . .

# Set Node environment to production
ENV NODE_ENV=production

# Render assigns a PORT dynamically. We expose 5000 as a default backup.
EXPOSE 5000

# Run start script
CMD ["npm", "start"]
