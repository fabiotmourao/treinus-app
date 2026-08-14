FROM node:20-alpine

WORKDIR /app

# curl is used by container healthchecks in docker-compose.
RUN apk add --no-cache curl

# Required for `expo start --tunnel` inside containers.
RUN npm install -g @expo/ngrok@^4.1.0 --no-audit --no-fund

COPY package*.json ./
RUN npm ci --no-audit --no-fund

COPY . .

EXPOSE 8081 19000 19001 19002 19006

CMD ["npm", "run", "start:docker:mobile"]
