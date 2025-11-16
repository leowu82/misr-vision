# MISR Vision Web

## Project Structure

```
/project
├── /backend
│   ├── /node_modules
│   ├── /src
│   │   ├── /controllers
│   │   ├── /models
│   │   ├── /routes
│   │   └── index.js
│   ├── package.json
│   ├── dockerfile
│   └── .dockerignore
│
├── /frontend
│   ├── /node_modules
│   ├── /public
│   │   └── index.html
│   ├── /src
│   │   ├── /components
│   │   ├── /pages
│   │   ├── App.js
│   │   └── index.js
│   ├── server.js
│   ├── package.json
│   ├── dockerfile
│   └── .dockerignore
│
├── .env
├── .gitignore
├── compose.yaml
└── README.md
```

## Prerequisites

- Docker & Docker Compose
- Node.js (for local dev without Docker)
- npm (for installing dependencies)

## Quick start (Docker Compose)

1. From the repository root:
   ```sh
   docker compose up --build
   ```

2. Open the frontend in your browser (http://35.226.92.160:8080/).