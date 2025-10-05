# Express Next.js WebSocket Demo with TypeScript

This is a full-stack TypeScript application demonstrating the integration of Express.js backend with Next.js frontend, featuring REST API and WebSocket communication.

## Features

- Express.js backend with TypeScript
  - Typed REST API endpoints
  - WebSocket server with typed events
  - Clean architecture with proper interfaces
- Next.js frontend with TypeScript
  - Server-side rendering capabilities
  - Client-side WebSocket integration
  - Type-safe components and hooks
  - Tailwind CSS for modern UI
  - API route handling and proxying
- Docker configuration for production-ready deployment

## Running the Application

### Docker Setup

The project provides a fully containerized setup using Docker Compose, which runs the following services:

PostgreSQL (db) – the database for storing board data

Express Backend (backend) – the REST API server built with Node.js + TypeORM

Next.js Frontend (frontend) – the React-based UI for managing boards

Getting Started

Install Docker & Docker Compose

Download Docker Desktop
for your OS.

Ensure both docker and docker compose commands work from your terminal:

```bash
docker --version
docker compose version
```

Build and start services

```bash
docker compose up --build
```

The application will be available at:

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

# Configuration

All service configuration (database, ports, credentials) is managed via the docker-compose.yml file.
You can override any environment variable using a local .env file in the backend directory, e.g.:

```
# Example .env
DB_HOST=db
DB_PORT=5432
DB_USERNAME=backend_user
DB_PASSWORD=password123
DB_NAME=backend_db
PORT=3001
```

Stop containers

```bash
docker compose down
```

Delete all container data

```bash
docker compose down -v
```

## Architecture

### Backend (Express.js + TypeScript)

- REST API endpoint at `/api/hello`
- WebSocket server broadcasting notifications every minute
- Running on port 3001
- Type-safe request/response handling
- CORS configured for frontend communication

### Frontend (Next.js + TypeScript)

- Modern React application with server-side rendering
- Custom WebSocket hook for real-time communication
- Displays messages from `/api/hello` endpoint
- Shows real-time notifications from WebSocket
- Running on port 3000
- Type-safe components and API integration
- Tailwind CSS for responsive design

## Development

### Development with Docker

```bash
# Start the development environment
docker compose -f docker-compose.dev.yml up --build

# Stop the development environment
docker compose -f docker-compose.dev.yml down
```

The development environment includes:

- Hot reloading for both frontend and backend
- Volume mounts for real-time code changes
- Development-specific configurations
- Isolated node_modules for each service

**Note about Package Management:** When adding new packages to either frontend or backend, you'll need to rebuild the Docker containers:

```bash
# 1. Stop the containers
docker compose -f docker-compose.dev.yml down

# 2. Rebuild and start the containers
docker compose -f docker-compose.dev.yml up --build
```

### Backend Development

```bash
cd backend
npm install
npm run dev (after dockerizing, it npm run dev doesn't appear to be working anymore)
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev (after dockerizing, it npm run dev doesn't appear to be working anymore)
```

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── index.ts    # Express server with WebSocket setup
│   │   └── types/      # TypeScript interfaces
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/        # Next.js pages
│   │   ├── components/ # React components
│   │   └── hooks/      # Custom hooks (WebSocket)
│   └── package.json
└── docker-compose.yml  # Development and production setup
```

## Environment Variables

### Backend

- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment mode

### Frontend

- `NEXT_PUBLIC_BACKEND_URL`: Backend API URL
- `PORT`: Frontend port (default: 3000)

## Features in Detail

1. **Real-time Communication**

   - Server sends notifications every minute
   - WebSocket connection with automatic reconnection
   - Connection status monitoring

2. **Type Safety**

   - Full TypeScript support
   - Typed WebSocket events
   - Type-safe API responses

3. **Modern UI**

   - Responsive design with Tailwind CSS
   - Clean and intuitive interface
   - Real-time updates without page refresh

4. **Production Ready**
   - Docker configuration for both services
   - Environment variable management
   - API proxying through Next.js

JASON GET UP AND RUNNING STEPS (without docker):

- brew install postgresql@16
- brew services start postgresql@16

- psql -U postgres
  CREATE DATABASE backend_db;
  CREATE USER backend_user WITH ENCRYPTED PASSWORD 'password123';
  GRANT ALL PRIVILEGES ON DATABASE backend_db TO backend_user;
  \c backend_db
  GRANT ALL ON SCHEMA public TO backend_user;
  ALTER SCHEMA public OWNER TO backend_user;
  \q to exit psql shell

generate db migrations: npm run migration:generate
apply db migrations: npm run migration:migrate
