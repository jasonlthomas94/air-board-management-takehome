# Use a lightweight Node image
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy dependency files first for better layer caching
COPY package*.json ./

# Install production dependencies
RUN npm ci

# Copy the rest of the source files
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript to dist/
RUN npm run build

# Expose backend port
EXPOSE 3001

CMD ["npm", "start"]
