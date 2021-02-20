#!/usr/bin/env bash
FILE=.env
cat /dev/null > $FILE
VERSION=$(git describe --tags)
echo "CLIENT_ID=${CLIENT_ID}" >> $FILE
echo "CLIENT_SECRET=${CLIENT_SECRET}" >> $FILE
echo "REFRESH_TOKEN=${REFRESH_TOKEN}" >> $FILE
echo "CMC_API_KEY=${CMC_API_KEY}" >> $FILE
echo "LOGGER_PATH=${LOGGER_PATH}" >> $FILE
echo "NODE_ENV=${NODE_ENV}" >> $FILE
echo "VERSION=${VERSION}" >> $FILE
echo "$(date +"%s")" > .timestamp
mkdir -p dist/
cp $FILE dist/

if [ "$CI" ]; then
  rm -rf db/*.json
  rm -rf logs/
fi