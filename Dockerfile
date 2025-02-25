# Use multi-stage build to reduce final image size
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and lock file separately to leverage caching
COPY package.json package-lock.json ./



# Copy the rest of the application files
COPY . .

# Build the app
RUN npm run build

# -- Production Stage --
FROM node:18-alpine AS runner

WORKDIR /app


# Set environment variable
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
