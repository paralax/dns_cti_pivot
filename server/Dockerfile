# Use an official Node.js runtime as a parent image
FROM node:18-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY server/package*.json ./

# Install any needed packages
RUN npm install

# Copy the rest of the application code to the working directory
COPY server/ .

# Make port 3001 available to the world outside this container
EXPOSE 3001

# Define the command to run the app
CMD [ "node", "index.js" ]
