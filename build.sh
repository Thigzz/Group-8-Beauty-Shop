#!/usr/bin/env bash
set -o errexit

# 1. InstallS Backend Dependencies
echo "--- Installing backend dependencies ---"
pip install -r server/requirements.txt

# 2. BuildS Frontend
echo "--- Building frontend ---"
cd client
npm install
npm run build
cd ..

# 3. Clean and move frontend build to a folder the backend can see
echo "--- Moving frontend build to server ---"
rm -rf server/build
mv client/dist server/build