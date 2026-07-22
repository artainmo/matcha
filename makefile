.PHONY: all frontend backend generate_users db_clean b docker-up docker-down

all: frontend backend
	# We use 'bundle exec' instead of 'ruby' to force the use of the gem versions indicated in the Gemfile; this will force the use of Sinatra 3.0.0 instead of the latest 4.0.0 which isn't compatible with this project.

docker-up: frontend
	docker-compose up

docker-down:
	docker-compose down

frontend:
	cd frontend && npm install && npm run build
	rm -rf backend/public/frontend
	mkdir -p backend/public/frontend
	cp -R dist/frontend/. backend/public/frontend/

backend:
	cd backend && ./setup.sh && bundle exec ruby myapp.rb

generate_users:
	cd backend && ./setup.sh && cd database/tests_and_scripts && bundle exec ruby generateUsers.rb $(AMOUNT) $(MAIL)

db_clean:
	cd backend && ./setup.sh && cd database/tests_and_scripts && bundle exec ruby cleanDatabase.rb

b:
	cd backend && bundle exec ruby myapp.rb
