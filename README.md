<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Error Monitoring Platform (Backend)

Welcome to the **Error Monitoring Platform** backend repository. This application is designed to ingest error events from SDKs, aggregate them into error groups, and provide visibility for teams managing their projects.

## 🚀 Features

- **User Authentication**: Secure signup and login mechanisms using JWT.
- **Team Management**: Create teams and manage members.
- **Project Management**: Create and configure projects for error tracking.
- **SDK Keys**: Generate and manage API keys for validating SDK requests.
- **Error Ingestion**: API endpoints to receive error events from client applications.
- **Error Aggregation**: Logic to group similar errors (Error Groups).
- **API Documentation**: Integrated Swagger UI for API exploration.

## 🛠️ Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) (Node.js)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [TypeORM](https://typeorm.io/)
- **Authentication**: Passport & JWT Strategies
- **Containerization**: Docker & Docker Compose
- **Validation**: `class-validator` & `class-transformer`

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/) & Docker Compose (for database containerization)

## ⚙️ Installation & Setup

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd error-monitor-backend
    ```

2.  **Install system dependencies:**

    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Environment Configuration:**
    Copy the template environment file to create your local configuration:

    ```bash
    cp .env.template .env
    ```

    Open `.env` and configure the variables. Example:

    ```env
    DB_PASSWORD=mysecretpassword
    DB_NAME=ErrorMonitorDB
    DB_HOST=localhost
    DB_PORT=5432
    DB_USERNAME=postgres

    PORT=3000
    HOST_API=http://localhost:3000/api
    JWT_SECRET=YourSuperSecretKeyHere
    ```

## 🐳 Running successfully with Docker (Database)

Using Docker Compose is the easiest way to spin up the PostgreSQL database needed for the application.

1.  **Start the Database:**

    ```bash
    docker-compose up -d
    ```

    This will start a PostgreSQL container exposing port `5432`.

2.  **Run the Application (Development Mode):**

    ```bash
    npm run start:dev
    ```

    The server will start at `http://localhost:3000`.

3.  **Run the Seeder (Optional):**
    If you need detailed initial data:
    ```bash
    npm run seed
    ```

## 📖 API Documentation

Once the application is running, you can access the Swagger documentation at:

**[http://localhost:3000/api](http://localhost:3000/api)**

This interface allows you to explore all available endpoints, their expected parameters, and responses.

## 📂 Project Structure

```
src/
├── modules/             # Application modules (features)
│   ├── auth/            # Authentication logic
│   ├── users/           # User management
│   ├── teams/           # Team management
│   ├── projects/        # Project management
│   ├── error-events/    # Error ingestion
│   └── ...
├── commons/             # Shared utilities/guards
├── config/              # Configuration files
└── main.ts              # Application entry point
```

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

## 📄 License

MIT License — see LICENSE file for details.

## 👥 Authors

See AUTHORS.md for project ownership and contributions.
