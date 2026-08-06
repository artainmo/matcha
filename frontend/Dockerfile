# Stage 1: Build the Angular application
FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Empty container used strictly to output the files
FROM scratch AS export-stage
# Copies everything inside the dist folder directly
COPY --from=build /dist/ ./
