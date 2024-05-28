# Use the official Node.js image as the base image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json or yarn.lock to the working directory
COPY package*.json ./
# COPY yarn.lock ./

# Install dependencies
RUN npm install
# RUN yarn install

# Copy the rest of the application code to the working directory
COPY . .

# Build the Next.js application
RUN DEBUG="*" npm run build 

# Expose the port the app runs on
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"]
