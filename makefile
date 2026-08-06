.PHONY: all frontend backend generate_users db_clean b docker-up docker-down docker-generate_users docker-db_clean

all: frontend copy-frontend backend
	# We use 'bundle exec' instead of 'ruby' to force the use of the gem versions indicated in the Gemfile; this will force the use of Sinatra 3.0.0 instead of the latest 4.0.0 which isn't compatible with this project.

docker-up: docker-frontend copy-frontend
	docker-compose up

docker-down:
	docker-compose down

docker-up-db:
	docker-compose up postgres

docker-up-backend:
	docker-compose up ruby

docker-db-clean:
	docker-compose down postgres -v

# Same as db_clean/generate_users, but run inside their own one-off 'ruby' container
# instead of on the host (no local ruby/gems setup needed). --name avoids clashing
# with the main 'matcha-ruby' container if the app is already running via docker-up.
docker-db_clean:
	docker-compose run --rm --name matcha-ruby-db_clean ruby sh -c "bundle install && cd database/tests_and_scripts && bundle exec ruby cleanDatabase.rb"

docker-generate_users:
	docker-compose run --rm --name matcha-ruby-generate_users ruby sh -c "bundle install && cd database/tests_and_scripts && bundle exec ruby generateUsers.rb $(AMOUNT) $(MAIL)"

docker-frontend:
	cd frontend; docker build -o ./dist --target export-stage .

copy-frontend:
	rm -rf backend/public/frontend
	mkdir -p backend/public/frontend
	cp -R frontend/dist/frontend/. backend/public/frontend/
	rm -rf frontend/dist

frontend:
	cd frontend && npm install && npm run build

backend:
	cd backend && ./setup.sh && bundle exec ruby myapp.rb

db_clean:
	cd backend && ./setup.sh && cd database/tests_and_scripts && bundle exec ruby cleanDatabase.rb

generate_users:
	cd backend && ./setup.sh && cd database/tests_and_scripts && bundle exec ruby generateUsers.rb $(AMOUNT) $(MAIL)

b:
	cd backend && bundle exec ruby myapp.rb
