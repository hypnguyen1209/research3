FROM node:lts-alpine

RUN adduser -D -u 1001 -g 1001 -s /bin/sh ctf

WORKDIR /app

COPY ./chall /app

COPY flag.txt /flag.txt

RUN mv /flag.txt /flag_`cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 6 | head -n 1`.txt

RUN npm i -g less

RUN npm i --production --silent \
    && rm -f package-*.json

RUN chown -R ctf:ctf /app

EXPOSE 1337

USER ctf

CMD npm start