# Use Ruby 3.3.5 slim image
FROM ruby:3.3.5-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy Gemfile and Gemfile.lock
COPY Gemfile Gemfile.lock ./

# Install Bundler and gems
RUN gem install bundler && bundle install

# Copy the application code
COPY . .

# Expose the port the app runs on
EXPOSE 1942

# Default command to run the app
CMD ["bundle", "exec", "ruby", "myapp.rb"]
