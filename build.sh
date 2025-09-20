#!/usr/bin/env bash
set -o errexit

# 1. Install Backend Dependencies
echo "--- Installing backend dependencies ---"
pip install -r server/requirements.txt

# 2. Apply database migrations
echo "--- Applying database migrations ---"
export FLASK_APP=server.app
flask db upgrade --directory server/migrations

# 3. Seed the database
echo "--- Seeding the database ---"
flask seed-db

# 4. Build Frontend
echo "--- Building frontend ---"
cd client
npm install
npm run build
cd ..

# 5. Clean and move frontend build to a folder the backend can see
echo "--- Moving frontend build to server ---"
rm -rf server/build
mv client/dist server/build