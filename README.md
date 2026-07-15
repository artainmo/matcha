# Welcome to Matcha!

42 school [subject](https://cdn.intra.42.fr/pdf/pdf/60925/en.subject.pdf).

This project uses ruby Sinatra as backend and AngularJS as frontend to build a dating app.

## Run

This project was created on macos.

For the frontend we used: Angular Cli 22.0.6; Node 24.15.0; and npm 11.11.0. Discrepancies can make the frontend hang. Verify you have the correct versions with: `npx ng version`. You can download the right versions in your terminal with: `brew install node@24`; `npm install`.

For the database we now run PostgreSQL in Docker instead of relying on Postgres.app.<br>
Install Docker Desktop (or another Docker engine with Compose support), then start the database with:
```
docker compose up -d postgres
```
The container creates the `matcha` database automatically and stores its data in a persistent Docker volume.<br>
By default the app connects with the following settings:
```
PGHOST=localhost
PGPORT=5433
PGDATABASE=matcha
PGUSER=postgres
PGPASSWORD=admin
```
You can copy `.env.example` to `.env` to customize the Docker container values. If you change them, export the same `PG*` variables before launching the Ruby backend so both sides stay aligned.<br>
Make sure the PostgreSQL container is running while launching the app, generating users, or cleaning the database.<br>

For the backend you should `brew install ruby@3.3`, afterwards you can add the following lines to your "~/.zshrc": 
```
# To launch the matcha ruby project
export PATH="/opt/homebrew/opt/ruby/bin:$PATH" #This signals the ruby executables to use the ruby version from homebrew and not the macOS' old system Ruby. This by prepending the path with the homebrew version to look at it first.
export PATH="$HOME/.gem/ruby/3.3.0/bin:$PATH" #Shows where the gem executables are. Gems are ruby dependencies.
```

Finally, to launch the whole app in one command:
```
make
```

To stop the database container:
```
docker compose down
```

To stop it and remove all PostgreSQL data for a clean database:
```
docker compose down -v
```

To generate users on dating site:
```
make generate_users AMOUNT=<number>
# OR SPECIFY YOUR EMAIL ADDRESS
make generate_users AMOUNT=<number> MAIL=<your-email-address>
# ONE OF THE USERS WILL BE NAMED 'test' 
# ALL USERS HAVE PASSWORD 'pass123'
```

To clean the database and locally stored images:
```
make db_clean
```

To run test frontend server with hot reload of frontend, do:
 1. Run the server part
 2. then `cd frontend && npm install && npm run serve`

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
