#!/bin/bash
cd /var/www/bustmarket-bot-playwright
Xvfb -ac :99 -screen 0 1600x900x16 & export DISPLAY=:99
npm start