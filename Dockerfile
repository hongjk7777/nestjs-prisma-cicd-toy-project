FROM node:16-alpine

# MySQL이 실행 된 후 Migrate를 진행하기 위해 dockerize 설정
ENV DOCKERIZE_VERSION v0.2.0  
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \  
    && tar -C /usr/local/bin -xzvf dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz

# Create app directory
WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY prisma ./prisma/

# Install app dependencies
RUN npm install
RUN npm install pm2 -g

COPY . .

ENV NODE_ENV=production

# CMD [ "npm", "run", "start" ]
RUN chmod +x docker-entrypoint.sh
ENTRYPOINT ["sh","/app/docker-entrypoint.sh"]

EXPOSE 3000