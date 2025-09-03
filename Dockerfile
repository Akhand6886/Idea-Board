# Stage 1: Build Vite frontend
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production server
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY server ./server
COPY --from=builder /app/dist ./dist
ENV PORT=3001
ENV NODE_ENV=production
EXPOSE 3001
CMD ["npm", "run", "server"]
