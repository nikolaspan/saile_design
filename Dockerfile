# Use multi-stage build to reduce final image size
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and lock file separately to leverage caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application files
COPY . .

# Build the app
RUN npm run build

# -- Production Stage --
FROM node:18-alpine AS runner

WORKDIR /app

# Copy only necessary files from builder stage
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Use non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Set environment variable
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
