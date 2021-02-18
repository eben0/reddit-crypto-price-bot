#!/usr/bin/env bash
FILE=.env
cat /dev/null > $FILE
echo "CLIENT_ID=${CLIENT_ID}" >> $FILE
echo "CLIENT_SECRET=${CLIENT_SECRET}" >> $FILE
echo "REFRESH_TOKEN=${REFRESH_TOKEN}" >> $FILE
echo "CMC_API_KEY=${CMC_API_KEY}" >> $FILE
echo "LOGGER_PATH=${LOGGER_PATH}" >> $FILE
echo "NODE_ENV=${NODE_ENV}" >> $FILE
