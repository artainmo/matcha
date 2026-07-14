# Welcome to Matcha!

42 school [subject](https://cdn.intra.42.fr/pdf/pdf/60925/en.subject.pdf).

This project uses ruby Sinatra as backend and AngularJS as frontend to build a dating app.

This project I initially made with [pvanderl](https://github.com/pvanderl) in this [repository](https://github.com/pvanderl/19_matcha), I re-uploaded it on my profile.

## Run

This project was created on macos.

For the frontend we used: Angular Cli 14.2.13; Node 18.20.8; and npm 10.8.2. Discrepancies can make the frontend hang. Verify you have the correct versions with: `npx ng version`. You can download the right versions in your terminal with: `brew install node@18`; `npm install -g @angular/cli@14`.

For the database we run a postgres server using 'https://postgresapp.com' on macos. After downloading the postgres app, within the app you can click on 'initialize' to start the server.<br>
Now access the psql command line by double clicking a default database such as the one named 'template1'. Within the psql command line you can use the following commands to create a matcha database:
```
CREATE USER postgres;
ALTER USER postgres WITH PASSWORD 'admin';
CREATE DATABASE matcha OWNER postgres;
```

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
