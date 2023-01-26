all:
	cd frontend && npm install && npm run build
	cd backend && ./setup.sh && ruby myapp.rb

generate_users:
	cd backend && ./setup.sh && cd database/tests_and_scripts && ruby generateUsers.rb $(AMOUNT) $(MAIL)

db_clean:
	cd backend && ./setup.sh && cd database/tests_and_scripts && ruby cleanDatabase.rb

b:
	cd backend && ruby myapp.rb
