#!/bin/bash
cd ..
git stash
git pull
npm install
sudo systemctl restart discord