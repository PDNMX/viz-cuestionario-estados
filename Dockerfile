FROM node:lts-alpine

MAINTAINER Sergio Rodríguez <sergio.rdzsg@gmail.com>

ADD ./ /viz-cuestionario-estados
WORKDIR /viz-cuestionario-estados

RUN yarn add global yarn \
&& yarn global add serve \
&& yarn global add pm2 \
&& yarn cache clean

#EXPOSE 5000

CMD ["pm2-runtime", "serve"]
