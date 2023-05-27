#!/bin/bash
docker compose down
docker rmi todo-app-backend todo-app-frontend
cd src/frontend
npm run build
cd ..
cd ..
docker compose up
