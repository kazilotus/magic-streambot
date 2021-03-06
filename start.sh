#!/bin/sh

# build the docker
sudo docker build -t scraperr . 

# start the container, expose to network and remove after running
# note: restart on fail --restart always, will conflict with --rm parameter, uncomment if needed
# sudo docker run --network=host --restart always -it scraper

# comment if you don't want to run and remove on exit
sudo docker run --network=host -v "/home/Puppeteer-with-xvfb/data:/data" --rm -it scraperr