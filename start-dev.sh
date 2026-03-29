#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Chaaya Development Setup${NC}\n"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo -e "${YELLOW}⚠️  Docker is not running. Starting Docker...${NC}"
  open "/Applications/Docker.app" || echo "Please start Docker manually"
  sleep 5
fi

# Start PostgreSQL in background
echo -e "${BLUE}1️⃣  Starting PostgreSQL...${NC}"
cd "$(dirname "$0")"
docker-compose down > /dev/null 2>&1
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
echo -e "${YELLOW}⏳ Waiting for PostgreSQL to be ready...${NC}"
sleep 3

# Run database migrations
echo -e "${BLUE}2️⃣  Running database migrations...${NC}"
cd lib/db
pnpm push --force 2>/dev/null || echo "Migrations may have already run"

# Start frontend
echo -e "${BLUE}3️⃣  Starting Frontend${NC}"
cd ../../artifacts/aasha
pnpm dev &
FRONTEND_PID=$!

# Display info
echo -e "\n${GREEN}✅ Setup complete!${NC}\n"
echo -e "${GREEN}Frontend:  ${BLUE}http://localhost:5173${NC}"
echo -e "${GREEN}Database:  ${BLUE}postgres://aasha@localhost:5432/aasha_db${NC}\n"

echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}\n"

# Cleanup on exit
trap "kill $FRONTEND_PID 2>/dev/null; docker-compose down" EXIT

# Wait for processes
wait
