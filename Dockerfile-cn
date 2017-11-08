FROM node:alpine

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install -g cnpm --registry=https://registry.npm.taobao.org
RUN cnpm install -g bower
#install git for bower!
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories \
	&& apk update && apk upgrade && \
    apk add --no-cache bash git openssh
RUN /usr/local/bin/bower install paper-avatar --allow-root --force-latest
RUN cnpm install

# Bundle app source
COPY . /usr/src/app

EXPOSE 3000
CMD [ "npm", "start" ]
