# Welcome to Matcha!

42 school [subject](https://cdn.intra.42.fr/pdf/pdf/217413/en.subject.pdf).

This project uses ruby Sinatra as backend and AngularJS as frontend to build a dating app.

## Table of contents

- [Use](#Use)
    - [Run with Docker](#Run-with-Docker)
        - [Prerequisites](#Prerequisites)
        - [Run the whole app with Docker](#Run-the-whole-app-with-Docker)
        - [Only use docker for the database (for local development)](#only-use-docker-for-the-database-for-local-development)
        - [View Logs](#View-Logs)
    - [Run without using any Docker](#Run-without-using-any-Docker)
    - [Database Management](#Database-Management)
- [Documentation](#Documentation)

## Use

### Run with Docker

#### Prerequisites

- **Docker Desktop** (or Docker Engine + Docker Compose)
- **Node.js 24.15.0** and **npm 11.11.0** (for frontend build)
- **Ruby 3.3.5** (for running the backend when docker is only used for the database)

The app uses these settings that you should configure in a `.env` file:
```
#We won't give the password publicly, ask it to pvanderl@student.42belgium.be. But the app can be tested without.
EMAILPASS=

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

# Secret used to sign/verify JWT auth tokens
JWT_SECRET=Thasé(à~a-é"çwonderful`^$ù^me`s$^rmcesrf)
```

#### Run the whole app with Docker

Launch the application with: `make docker-up`.<br>
This will:
1. Build the Angular frontend
2. Start the PostgreSQL database container
3. Start the Ruby Sinatra backend container
4. Serve the app at **http://localhost:1942**

Stop the application with: `make docker-down`.

#### Only use docker for the database (for local development) 

For the frontend we use: Angular CLI 22.0.6; Node 24.15.0; and npm 11.11.0. Discrepancies can make the frontend hang. Verify you have the correct versions with: `npx ng version`. You can download the right versions in your terminal with: `brew install node@24`; `npm install -g @angular/cli@22`.

For the backend, install Ruby 3.3.5 with: `brew install ruby@3.3`.<br>
Then add these lines to your `~/.zshrc`:
```
# To launch the matcha ruby project
export PATH="/opt/homebrew/opt/ruby@3.3/bin:$PATH"
export PATH="$HOME/.gem/ruby/3.3.0/bin:$PATH"
```

You can launch the database via docker with `docker compose up -d postgres`.<br>
Afterwards you can launch the backend and frontend with `make`.<br>
Thus to launch the app you need the following commands:
```
docker compose up -d postgres
make
```

To run test frontend server with hot reload of frontend, do:
1. Run the server part
2. then cd frontend && npm install && npm run serve

#### View Logs
```
# Ruby app logs
docker logs matcha-ruby

# PostgreSQL logs
docker logs matcha-postgres

# Follow logs in real-time
docker logs -f matcha-ruby
```

### Run without using any Docker

This project can be run on macos without using docker. In that case you should have no `.env` and remove it if one exists.

For the frontend we use: Angular CLI 22.0.6; Node 24.15.0; and npm 11.11.0. Discrepancies can make the frontend hang. Verify you have the correct versions with: `npx ng version`. You can download the right versions in your terminal with: `brew install node@24`; `npm install -g @angular/cli@22`.

For the database we run a postgres server using 'https://postgresapp.com' on macos. After downloading the postgres app, within the app you can click on 'initialize' to start the server.<br>
Now access the psql command line by double clicking a default database such as the one named 'template1'. Within the psql command line you can use the following commands to create a matcha database:
```
CREATE USER postgres;
ALTER USER postgres WITH PASSWORD 'admin';
CREATE DATABASE matcha OWNER postgres;
```
Make sure the postgres server runs while launching the app, generating users, or cleaning the database.

For the backend you should `brew install ruby@3.3`, afterwards you can add the following lines to your "~/.zshrc":
```
# To launch the matcha ruby project
export PATH="/opt/homebrew/opt/ruby/bin:$PATH" #This signals the ruby executables to use the ruby version from homebrew and not the macOS' old system Ruby. This by prepending the path with the homebrew version to look at it first.
export PATH="$HOME/.gem/ruby/3.3.0/bin:$PATH" #Shows where the gem executables are. Gems are ruby dependencies.
```

Subsequently the email password needs to be given. You can do this with `export EMAILPASS=""` (we won't give the password publicly, ask it to pvanderl@student.42belgium.be, but the app can work without it for testing purposes).<br>
You also need to set the JWT signing secret:
```
export JWT_SECRET='Thasé(à~a-é"çwonderful`^$ù^me`s$^rmcesrf)'
```

Finally, to launch the whole app in one command:
```
make
```

To run test frontend server with hot reload of frontend, do:
1. Run the server part
2. then cd frontend && npm install && npm run serve

### Database Management

Generate test users:
```
make generate_users AMOUNT=<number>
# OR SPECIFY YOUR EMAIL ADDRESS
make generate_users AMOUNT=<number> MAIL=<your-email-address>
# ONE OF THE USERS WILL BE NAMED 'test' 
# ALL USERS HAVE PASSWORD 'pass123'
make docker-generate_users AMOUNT=<number> MAIL=<your-email-address>
# If the app runs on docker it is recommended to use this command instead.
```

Clean the database and locally stored images:
```
make db_clean
make docker-db_clean # If the app runs on docker it is recommended to use this command instead.
```

Stop the database container if it runs with docker:
```
docker compose down
```

Stop and remove all PostgreSQL data (clean database) if it runs with docker:
```
docker compose down -v
```

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
