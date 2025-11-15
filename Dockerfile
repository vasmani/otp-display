FROM node:20-slim

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

ENV HTTP_PORT=63791
ENV SERIAL_PORT_PATH=/dev/tty.usbmodem22101

EXPOSE ${HTTP_PORT}

CMD ["npm", "start"]