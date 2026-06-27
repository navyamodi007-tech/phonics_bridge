FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy the rest of the application code
COPY . .

# Create uploads directory for temporary audio files
RUN mkdir -p uploads

# Build the TypeScript code
RUN npx tsc

# Expose the port the app runs on
EXPOSE 4000

# Start the application
CMD ["node", "dist/index.js"]
