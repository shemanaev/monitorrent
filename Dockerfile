# Frontend builder
FROM node:10-alpine AS js-build

WORKDIR /var/www/monitorrent

COPY package.json ./
RUN npm install --unsafe-perm

COPY gulpfile.js ./
COPY ./src ./src
RUN gulp

# Python packages builder
FROM python:3.8-alpine AS py-build

COPY requirements.txt ./

RUN apk add --no-cache build-base
RUN pip install -r requirements.txt
RUN pip install PySocks

# Actual image
FROM python:3.8-alpine
LABEL maintainer="denis.shemanaev@gmail.com"

WORKDIR /var/www/monitorrent

COPY monitorrent /var/www/monitorrent/monitorrent
COPY server.py /var/www/monitorrent
COPY --from=js-build /var/www/monitorrent/webapp /var/www/monitorrent/webapp
COPY --from=py-build /usr/local/lib/python3.8/site-packages /usr/local/lib/python3.8/site-packages

EXPOSE 6687

CMD ["python", "server.py"]
