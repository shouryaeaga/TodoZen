#!/bin/bash
docker compose down
docker rmi todo-backend todo-frontend
cd src/frontend
npm run build
cd ..
cd ..
docker compose up
