#!/bin/bash
npm install
npm install fastify-cli -g
mkdir build
ln --symbolic src/static build/static
cp -r ./data ./build/data
