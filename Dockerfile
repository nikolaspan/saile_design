# Use the official Node.js image from Docker Hub
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn files) into the container
COPY package*.json ./

# Install the dependencies inside the container
RUN npm install

# Copy the rest of the application code into the container
COPY . .

# Expose port 3000
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "run", "dev"]