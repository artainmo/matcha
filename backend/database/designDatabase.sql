CREATE TABLE account (
	username varchar(20) PRIMARY KEY,
	password varchar(100) NOT NULL,
	email varchar(100),
	firstname varchar(20),
	lastname varchar(20),
	-- UNIQUE (firstname, lastname),
	gender varchar(10) CHECK ((gender = 'MALE') or (gender =  'FEMALE')
								or (gender =  'OTHER')),
	sexual_orientation varchar(10) CHECK ((sexual_orientation = 'MALE') or
		(sexual_orientation = 'FEMALE') or (sexual_orientation = 'BI')
		or (sexual_orientation = 'OTHER')),
	biography varchar(1000),
	birthday date,
	last_connected timestamp,
	-- cannot put ref to picture as it's a table created later --  REFERENCES picture(storage_path),
	profile_picture varchar(250),
	geolocation point,
	online boolean NOT NULL DEFAULT false,
	fake_account boolean DEFAULT false,
	verified boolean DEFAULT false,
  custom_geolocation boolean DEFAULT false
);

-- Tokens are associated to an account and used for email verification or password reset.
CREATE TABLE token (
	hashed_token varchar(50) PRIMARY KEY,
	account_id varchar(20) UNIQUE REFERENCES account(username),
	expiry_time timestamp NOT NULL
);

CREATE TABLE tag (
	account_id varchar(20) REFERENCES account(username),
	tag varchar(20),
	PRIMARY KEY (account_id, tag)
);

CREATE TABLE visit (
	visiter_id varchar(20) REFERENCES account(username) NOT NULL,
	visited_id varchar(20) REFERENCES account(username)
				CHECK (visited_id != visiter_id) NOT NULL,
	PRIMARY KEY (visiter_id, visited_id),
	time timestamp NOT NULL
);

CREATE TABLE blocked (
	blocker_id varchar(20) REFERENCES account(username),
	blocked_id varchar(20) REFERENCES account(username) CHECK (blocked_id != blocker_id),
	PRIMARY KEY (blocker_id, blocked_id)
);

CREATE TABLE liked (
	liker_id varchar(20) REFERENCES account(username),
	liked_id varchar(20) REFERENCES account(username) CHECK (liked_id != liker_id),
	PRIMARY KEY (liker_id, liked_id),
	time timestamp NOT NULL
);

CREATE TABLE message (
	id UUID PRIMARY KEY,
	sender_id varchar(20) REFERENCES account(username) NOT NULL,
	receiver_id varchar(20) REFERENCES account(username)
				CHECK (receiver_id != sender_id) NOT NULL,
	content varchar(100),
	time timestamp NOT NULL
);

CREATE TABLE notification (
	id UUID PRIMARY KEY,
	account_id varchar(20) REFERENCES account(username) NOT NULL,
	time timestamp NOT NULL,
	title varchar(20) NOT NULL,
	content varchar(50) NOT NULL,
	notif_type varchar(12) CHECK ((notif_type = 'LIKE') or (notif_type = 'LIKED_BACK')
		or (notif_type = 'UNLIKED') or (notif_type = 'VIEWED')
		or (notif_type = 'MESSAGE')) NOT NULL,
	opened boolean DEFAULT false
);

CREATE TABLE picture (
	storage_path varchar(250) PRIMARY KEY,
	account_id varchar(20) REFERENCES account(username) NOT NULL
);

CREATE EXTENSION IF NOT EXISTS earthdistance CASCADE;
