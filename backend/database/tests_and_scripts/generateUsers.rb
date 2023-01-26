require __dir__ + '/../databaseManager.rb'
require 'random_name_generator'

#Helper functions
def geolocationCoordinates(ipOrAddress)
  geolocation = Geocoder.search(ipOrAddress)
  return false if geolocation.first == nil
  return geolocation.first.coordinates.join(',')
end

#Predefine values
if !ARGV[0] || (ARGV[0] = ARGV[0].to_i) == 0
  puts "At least one argument of integer type must be given."
  exit 1
end
AMOUNT = ARGV[0]
ARGV[1] ? personal_email = ARGV[1] : personal_email = 'tainmontarthur@gmail.com'
locations = ['Brussels', 'Gent', 'Antwerpen', 'Paris', 'Dublin']
tags = ['tennis', 'chess', 'school19', 'music', 'travel']
password = 'pass123'
genders = ['MALE', 'FEMALE', 'OTHER']
sexual_orientations = ['MALE', 'FEMALE', 'BI', 'OTHER']
bios = ['The last time I was someone’s “type” was when I donated blood.', 'Give me your best pickup line.',
  'Looking for the pepperoni to my pizza, the peanut butter to my jelly, the cheese to my crackers. Oh dang… now I’m hungry.',
  'They say love happens when you least expect it, and trust me, my expectations could not be lower right now.',
  'If we match, that means we have to get married, right?']

#Start database
db = DatabaseManager.new
db.createDatabase

#Generate predefined user
db.createFullAccountForTestPurposes('test', password,
  personal_email, 'Rob', 'Howard', genders[0], sexual_orientations[1], bios[0],
  '1998-03-04', Time.now(), geolocationCoordinates(locations[0]), tags[0])

#Generate random users
i = 1
while i < AMOUNT
  username = RandomNameGenerator.new.compose
  geolocation = geolocationCoordinates(locations[rand(5)])
  firstname = RandomNameGenerator.new.compose
  tag = tags[rand(5)]
  lastname = RandomNameGenerator.new.compose
  gender = genders[rand(3)]
  birthday = Time.at(rand * Time.now.to_i).to_s[0,10]
  biography = bios[rand(5)]
  last_connected = Time.now()
  sexual_orientation = sexual_orientations[rand(4)]

  ret = db.createFullAccountForTestPurposes(username, password, personal_email, firstname,
                  lastname, gender, sexual_orientation, biography, birthday,
                  last_connected, geolocation, tag)
  i += 1 if ret == 'CREATED'
end
