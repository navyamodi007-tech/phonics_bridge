FROM node:22-alpine

# Set working directory
WORKDIR /app

# Python 3 + reportlab are required by src/generate_pdf_report.py, which the
# weekly principal report shells out to via exec("python3 ...").
RUN apk add --no-cache python3 py3-pip \
    && pip3 install --no-cache-dir --break-system-packages reportlab

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

# tsc only emits .js, and .dockerignore excludes dist/, so the PDF generator
# script has to be copied into dist/ explicitly — index.js resolves it via
# path.resolve(__dirname, 'generate_pdf_report.py').
RUN cp src/generate_pdf_report.py dist/generate_pdf_report.py

# Expose the port the app runs on
EXPOSE 4000

# Start the application
CMD ["node", "dist/index.js"]
