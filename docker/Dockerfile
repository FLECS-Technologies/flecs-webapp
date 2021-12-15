FROM httpd:2.4-alpine

ADD build/ /usr/local/apache2/htdocs/

COPY docker/conf/httpd.conf /usr/local/apache2/conf/httpd.conf
COPY docker/conf/extra/httpd-vhosts.conf /usr/local/apache2/conf/extra/httpd-vhosts.conf
