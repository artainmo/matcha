# Welcome to Matcha!

This project uses ruby Sinatra as backend and AngularJS as frontend to build a dating app.

https://cdn.intra.42.fr/pdf/pdf/60925/en.subject.pdf

This project I initially made with [pvanderl](https://github.com/pvanderl) in this [repository](https://github.com/pvanderl/19_matcha), I re-uploaded it on my profile.

## Run

To run the whole app in one command:
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

### Interfaces tools
[Swagger editor (microservice contract editor tool)](https://editor.swagger.io/)<br>
[UML editor (DB schema editor tool)](https://planttext.com/)
