FROM nginx:mainline-alpine

ARG REACT_APP_ENVIRONMENT
ENV REACT_APP_ENVIRONMENT=${REACT_APP_ENVIRONMENT}

COPY docker/conf.d/default.conf /etc/nginx/conf.d/

ADD build/ /usr/share/nginx/html/ui/
