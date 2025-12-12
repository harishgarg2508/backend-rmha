# Base image
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy dependency definitions
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the app
RUN npm run build

# Expose the API port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:prod"]