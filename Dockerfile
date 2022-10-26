FROM node:16-alpine

MAINTAINER Sergio Rodríguez <sergio.rdzsg@gmail.com>

ADD ./ /viz-cuestionario-estados
WORKDIR /viz-cuestionario-estados

RUN yarn add global yarn \
&& yarn global add serve \
&& yarn cache clean

#EXPOSE 3000

CMD ["serve", "/viz-cuestionario-estados"]
