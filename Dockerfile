FROM node:8.12-alpine
ENV env=development
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../
COPY . .

RUN apk add g++ make python3
RUN --mount=type=secret,id=DB_USER \
    --mount=type=secret,id=DB_PASS \
    --mount=type=secret,id=DB_NAME \
    export DB_USER=$(cat /run/secrets/DB_USER) && \
    export DB_PASS=$(cat /run/secrets/DB_PASS) && \
    export DB_NAME=$(cat /run/secrets/DB_NAME)
RUN python genenv.py && \
    echo $DB_NAME

EXPOSE 4000
RUN chown -R node /usr/src/app
USER node
CMD ["npm", "start"]
