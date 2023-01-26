if ! [[ $(gem list | grep 'pg') ]]; then
	pgPath=$(sudo find / -name "pg_config" 2>/dev/null | head -n 1)
	gem install pg -- --with-pg-config=$pgPath --user-install
fi
if ! [[ $(gem list | grep 'bundler (2.3.18') ]]; then
	gem install bundler:2.3.18 --user-install
fi
if ! [[ $(gem list | grep 'pristine') ]]; then
	gem install pristine --user-install
fi
if ! [[ $(gem list | grep 'eventmachine') ]]; then
	gem install eventmachine:1.0.9.1 --user-install
fi
if ! [[ $(gem list | grep 'bcrypt') ]]; then
	gem install bcrypt:3.1.18 --user-install
fi
if ! [[ $(gem list | grep 'geocoder') ]]; then
	bundle install
fi
# If this error occurs 'You don't have write permissions for the /Library/Ruby/Gems/2.6.0 directory.' -> export GEM_HOME="$HOME/.gem"
