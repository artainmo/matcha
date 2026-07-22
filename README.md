# Welcome to Matcha!

42 school [subject](https://cdn.intra.42.fr/pdf/pdf/60925/en.subject.pdf).

This project uses ruby Sinatra as backend and AngularJS as frontend to build a dating app.
## Prerequisites
**Docker**

#### Environment Variables
By default the app uses these settings (configure in `.env`):
```bash
# For Docker networking (use 'postgres' as hostname inside Docker)
PGHOST=postgres
PGPORT=5432
PGDATABASE=matcha
PGUSER=postgres
PGPASSWORD=admin

# For Docker container initialization
POSTGRES_DB=matcha
POSTGRES_USER=postgres
POSTGRES_PASSWORD=admin
```

You can create a `.env` file from `.env.example` to customize these values. If you change them when running without Docker, make sure to export the same `PG*` variables before launching the Ruby backend so both sides stay aligned.

**Note for local (non-Docker) development:** Use `PGHOST=localhost` and `PGPORT=5433` to connect to the PostgreSQL container from your host machine.


## Quick Start with Docker (Recommended)

The easiest way to run the entire Matcha application is with Docker:

### Prerequisites
- **Docker Desktop** (or Docker Engine + Docker Compose)
- **Node.js 24.15.0** and **npm 11.11.0** (for frontend build)
- **Ruby 3.3.5** (only needed if running without Docker)

### Run Everything with Docker

Simply run:
```bash
make docker-up
```

This will:
1. Build the Angular frontend
2. Start the PostgreSQL database container
3. Start the Ruby Sinatra backend container
4. Serve the app at **http://localhost:1942**

The database is automatically initialized and persists in a Docker volume.

### Stop the Application

```bash
make docker-down
```

---

## Manual Setup (Without Docker)

If you prefer to run the application locally without Docker:

### Frontend Setup
For the frontend we use: Angular CLI 22.0.6; Node 24.15.0; and npm 11.11.0. Discrepancies can make the frontend hang. Verify you have the correct versions with: `npx ng version`. You can download the right versions in your terminal with: `brew install node@24`; `npm install`.

### Database Setup
PostgreSQL 16 runs in Docker for consistency. Start it with:
```bash
docker compose up -d postgres
```

The container creates the `matcha` database automatically and stores its data in a persistent Docker volume.

### Backend Setup
Install Ruby 3.3.5:
```bash
brew install ruby@3.3
```

Then add these lines to your `~/.zshrc`:
```bash
# To launch the matcha ruby project
export PATH="/opt/homebrew/opt/ruby@3.3/bin:$PATH"
export PATH="$HOME/.gem/ruby/3.3.0/bin:$PATH"
```

### Run the App Locally (Without Docker)

To launch the whole app in one command:
```bash
make backend
```

Or just run the backend server:
```bash
make b
```

This starts Sinatra on port 1942, which serves both the API and the built frontend.

---

## Useful Commands

### View Logs
```bash
# Ruby app logs
docker logs matcha-ruby

# PostgreSQL logs
docker logs matcha-postgres

# Follow logs in real-time
docker logs -f matcha-ruby
```

### Database Management

Stop the database container:
```bash
docker compose down
```

Stop and remove all PostgreSQL data (clean database):
```bash
docker compose down -v
```

Generate test users:
```bash
make generate_users AMOUNT=<number>
# OR SPECIFY YOUR EMAIL ADDRESS
make generate_users AMOUNT=<number> MAIL=<your-email-address>
# ONE OF THE USERS WILL BE NAMED 'test' 
# ALL USERS HAVE PASSWORD 'pass123'
```

Clean the database and locally stored images:
```bash
make db_clean
```

### Frontend Development

To run test frontend server with hot reload:
1. Start the backend: `make docker-up` or `make b`
2. In a new terminal: `cd frontend && npm install && npm run serve`

---

## Documentation
### Backend
[Ruby documentation](https://www.ruby-lang.org/en/documentation/)<br>
[Sinatra documentation](http://sinatrarb.com/documentation.html)<br>
[Sinatra configuration documentation](http://sinatrarb.com/configuration.html)<br>
[Geocoder](https://github.com/alexreisner/geocoder)<br>

### Frontend
[Angular](https://angular.io)

### Design tools
[Swagger editor (microservice contract editor tool)](https://editor.swagger.io/)<br>
A Swagger Editor is used to design, edit, and validate REST APIs. It lets you write API definitions in YAML or JSON. A Swagger Editor checks whether your syntax is valid and generates API documentation automatically. The result can be considered a "contract", which means an agreement that defines how clients and servers communicate.

[UML editor (DB schema editor tool)](https://planttext.com/)<br>
A UML (Unified Modeling Language) Editor is used to create diagrams that model the structure and behavior of software systems. Here we used class diagrams to design the database.
