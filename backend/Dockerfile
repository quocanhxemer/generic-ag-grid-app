FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN chmod +x setup_script.sh

EXPOSE 8080

CMD ["sh", "-c", "./setup_script.sh"]
