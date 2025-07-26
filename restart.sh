#!/bin/bash
cd .. || exit 1
git stash ||exit 1
git pull || exit 1
npm install || exit 1
systemctl restart discord || exit 1