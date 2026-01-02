FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
# We need to handle the cache issue in the container too ideally, but here we run as root by default so it might be fine.
# But just in case, we'll just do normal install
RUN npm install

COPY . .

# For development, we'll use nodemon via command in docker-compose, but this is good for prod build
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
