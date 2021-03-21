#!/bin/sh

echo remove dir and zip
rm -rf notification-to-Slack-dist/

echo compile ts
tsc -p tsconfig.json

echo copy package.json
cp -f ./package.json ./notification-to-Slack-dist

echo install module
cd notification-to-Slack-dist
yarn install

echo zip
zip -r notification-to-Slack-dist.zip ./
