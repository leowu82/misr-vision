# MISR Vision Web

## Project Structure

```
/project
├── /backend
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
│   ├── /public           # Static assets (favicon, robots.txt)
│   ├── /src
│   │   ├── /components
│   │   ├── /pages
│   │   ├── App.jsx       # Main Application Component
│   │   └── index.jsx     # Entry point (mounts React to DOM)
│   ├── nginx.conf        # Nginx config for Production serving & Proxying
│   ├── vite.config.js    # Vite configuration (Port, Proxy, Plugins)
│   ├── index.html        # Entry HTML file (Vite convention)
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

- Docker Desktop (includes Docker Compose)
- Node.js v18+ (Required if running locally without Docker)
- npm or yarn

## Quick start (Docker Compose)

1. From the repository root:
   ```sh
   docker compose up --build
   ```

2. Open the frontend in your browser (http://35.226.92.160:8080/).