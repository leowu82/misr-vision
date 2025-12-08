# MISR Vision 🛰️

MISR Vision is a full-stack web application designed to visualize and analyze satellite data from the Multi-angle Imaging SpectroRadiometer (MISR) instrument.

It provides an interactive interface for researchers to visualize high-resolution pixel radiance data mapped to geolocation coordinates.


## Tech Stack

**Frontend**
- Framework: React 18 (Vite)
- Styling: Tailwind CSS
- Server: Nginx (Alpine Linux) for static serving and reverse proxying.

**Backend**
- Runtime: Node.js (Express)
- Security: bcryptjs (Hashing), jsonwebtoken (Auth).
- Architecture: MVC (Model-View-Controller) with Clean Architecture principles.

**Database & DevOps**
- Database: MySQL (Google Cloud SQL)
- Infrastructure: Docker & Docker Compose (Multi-stage builds).
- Connection: Cloud SQL Auth Proxy for secure tunneling.


## Project Structure

```Plaintext
/project
├── /backend
│   ├── /src
│   │   ├── /config         # Database pool & environment config
│   │   ├── /controllers    # Core logic (Auth, spatial queries, transactions)
│   │   ├── /middleware     # JWT verification
│   │   ├── /routes         # API Endpoint definitions
│   │   └── index.js        # Entry point
│   ├── dockerfile
│   └── package.json
│
├── /frontend
│   ├── /src
│   │   ├── /components     # Reusable UI (AuthParams, PixelMap, Tables)
│   │   ├── App.jsx         # Main Layout & State
│   │   └── index.jsx       # Entry point (mounts React to DOM)
│   ├── index.html          # Entry HTML file (Vite convention)
│   ├── dockerfile          # Multi-stage (Build -> Nginx)
│   ├── nginx.conf          # Reverse Proxy Config
│   └── vite.config.js
│
├── compose.yaml            # Orchestration for Frontend, Backend, and SQL Proxy
└── .env                    # Secrets (Not committed)
```


## Getting Started

**Prerequisites**

- Docker Desktop installed.
- Google Cloud Credentials JSON file (if connecting to remote Cloud SQL).

**Installation**

- Clone the repository
```Shell
git clone https://github.com/cs411-alawini/fa25-cs411-team062-SpaceBots.git
cd fa25-cs411-team062-SpaceBots/project
```

- Configure Environment Create a .env file in the root directory:
```
DB_USER=root
DB_PASS=your_password
DB_NAME=misr_vision_db
INSTANCE_CONNECTION_NAME=your-project:region:instance
JWT_SECRET=super_secret_key
```

- Run with Docker Start the entire stack (Frontend, Backend, and Proxy):
```Shell
docker compose up --build
```


## Access the App

**Frontend**: http://35.226.92.160:8080

**Backend API**: http://35.226.92.160:3000 (Internal)


## Architecture Overview

- **Nginx Container**: Acts as the entry point. It serves the static React build files (index.html, assets/).

- **Reverse Proxy**: Requests starting with /api/ are forwarded by Nginx to the Backend Container.

- **Backend Container**: Node.js processes the request, checks the JWT token, and executes SQL queries.

- **Cloud SQL Proxy**: The Backend connects to the database via a secure sidecar container (cloud-sql-proxy), eliminating the need to expose the DB to the public internet.