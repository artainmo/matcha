require 'sinatra'
require 'json'
require 'date'
require "sinatra/cookies"
require "jwt"
require 'pony'
require 'geocoder'
require 'net/http'
require 'fileutils'
require __dir__ + '/database/databaseManager.rb'

=begin
  LAUNCH DATABASE
=end

db_start = DatabaseManager.new
db_start.createDatabase

=begin
  CONFIGURATION
=end

username = '' #username will be defined later through cookies if cookies are used. It must be declared as global variable else it would not be accessible throughout the app.
set :port, 1942
frontend = 'http://localhost:1942'

jwt_token = 'Thasé(à~a-é"çwonderful`^$ù^me`s$^rmcesrf)'

Geocoder.configure(timeout: 10)

before do
    if cookies[:username]
	    username = JWT.decode cookies[:username], nil, false
      username = username[0]
      db = DatabaseManager.new
      db.updateLastSeen(username)
    end
end

enable :static # Before searching route patterns direct matches with file names
set :public_folder, '../dist/frontend' # in :public_folder will be searched

get /\/(?!((rest)|(images))).*/ do
  send_file '../dist/frontend/index.html'
end

get /\/images\/.*/ do
  path = CGI.unescape(request.path_info)
  puts "Asking for the following image #{path}"
  send_file '../public/' + path
end

# ACCOUNT TABLE ROUTES

post '/rest/account/register' do
  db = DatabaseManager.new
  body = JSON.parse request.body.read
  ret = db.createAccount(body['username'], body['password'],
        body['email'], body['firstname'], body['lastname'])
  return 417, ret if ret != 'CREATED'
  payload = {
    data: body['username']
  }
  token = JWT.encode payload, jwt_token, 'HS256'
  return 417, "Mail is not valid" if !send_mail(body['email'],
        "Verify Matcha Account",
  		  "Click on the following link to verify your account: " +
        frontend + "/profile/verify/" +
        token)
  return 200
end

post '/rest/account/verify' do
  db = DatabaseManager.new
  token = request.body.read
  return 400, nil unless token
  payload = JWT.decode token, jwt_token, true, {algorithm: 'HS256'}
  return 404, nil unless payload[0]['data']
  db.verifyAccount(payload[0]['data'])
  return 200, {}
end

patch '/rest/account/fill' do
  db = DatabaseManager.new
  body = JSON.parse request.body.read
  ret = db.updateAccount(username, 'gender', body['gender'])
  return 417, ret if ret != 'UPDATED'
  ret = db.updateAccount(username, 'sexual_orientation', body['sexual_orientation'])
  return 417, ret if ret != 'UPDATED'
  ret = db.updateAccount(username, 'biography', body['biography'])
  return 417, ret if ret != 'UPDATED'
  ret = db.updateAccount(username, 'birthday', body['birthday'])
  return 417, ret if ret != 'UPDATED'
  ret = db.updateAccount(username, 'last_connected', Time.now())
  return 417, ret if ret != 'UPDATED'
  ret = db.updateAccount(username, 'profile_picture', body['profile_picture'])
  return 417, ret if ret != 'UPDATED'
  if body['tags']
    body['tags'].each { |tag|
      ret = db.createTag(username, tag)
      return 417, ret if ret != 'CREATED' && ret[0,54] != 'ERROR:  duplicate key value violates unique constraint'
    }
  end
  geolocation = getGeolocationCoordinates(body['geolocation'], request.ip)
  return 417, "Wrong geolocation" if geolocation == false
  ret = db.updateAccount(username, 'geolocation', geolocation)
  return 417, ret if ret != 'UPDATED'
  return 200, ret
end

patch '/rest/account' do
  db = DatabaseManager.new
  body = JSON.parse request.body.read
  if body['email']
    return 417, "Mail is not valid" if !send_mail(body['email'], "New Matcha Email Address",
    		  "This is the new email address you setup on your Matcha account #{username}.")
    ret = db.updateAccount(username, 'email', body['email'])
    return 417 if ret != 'UPDATED'
  end
  if body['gender']
    ret = db.updateAccount(username, 'gender', body['gender'])
    return 417 if ret != 'UPDATED'
  end
  if body['sexual_orientation']
    ret = db.updateAccount(username, 'sexual_orientation', body['sexual_orientation'])
    return 417 if ret != 'UPDATED'
  end
  if body['biography']
    ret = db.updateAccount(username, 'biography', body['biography'])
    return 417 if ret != 'UPDATED'
  end
  if body['birthday']
    ret = db.updateAccount(username, 'birthday', body['birthday'])
    return 417 if ret != 'UPDATED'
  end
  if body['profile_picture']
    ret = db.updateAccount(username, 'profile_picture', body['profile_picture'])
    return 417 if ret != 'UPDATED'
  end
  if body['firstname']
    ret = db.updateAccount(username, 'firstname', body['firstname'])
    return 417 if ret != 'UPDATED'
  end
  if body['lastname']
    ret = db.updateAccount(username, 'lastname', body['lastname'])
    return 417 if ret != 'UPDATED'
  end
  if body['tags']
    ret = db.deleteTagsOfUser(username)
    body['tags'].each { |tag|
      ret = db.createTag(username, tag)
      return 417 if ret != 'CREATED'
    }
  end
  if body['geolocation']
    if body['geolocation'] == ''
      ret = db.updateAccount(username, 'custom_geolocation', false)
      geolocation = getGeolocationCoordinates(nil, request.ip)
      return 417, "Wrong geolocation" if geolocation == false
      db.updateGeolocation(username, geolocation)
      return 417, ret if ret != 'UPDATED'
    else
      ret = db.updateAccount(username, 'custom_geolocation', true)
      geolocation = geolocationCoordinates(body['geolocation'])
      return 417, "Wrong geolocation" if geolocation == false
      ret = db.updateAccount(username, 'geolocation', geolocation)
      return 417, ret if ret != 'UPDATED'
    end
  end
  return 200, ret
end

get '/rest/account/find/:_username' do |_username|
  db = DatabaseManager.new
  accounts = db.findAccount(_username)
  affected_rows = accounts.cmd_tuples
  return 404, "Username not found" if affected_rows == 0
  if _username != username && _username != '' && username != ''
    ret = db.createVisit(username, _username)
    return 417, ret if ret != 'CREATED'
    db.createNotification(username, _username, "account view",
                          "account viewed by #{username}", "VIEWED")
  end
  ret = db.findTagsOfUser(_username)
  tags = []
  ret.values.each { |line|
    tags.append(line[1])
  }
  liked = false
  likes_back = false
  connected = false
  blocked = false
  if _username != username
    liked = db.findLiked(username, _username).cmd_tuples > 0
    likes_back = db.findLiked(_username, username).cmd_tuples > 0
    blocked = db.isBlockedBy(username, _username)
    connected = db.findLiked(_username, username).cmd_tuples > 0 && liked
  end
  pictures = db.findPicturesUser(_username).values.map {|a| a[0]}
  return 200, toAccountObject(accounts.values[0], tags, liked, likes_back, connected, pictures, blocked).to_json
end

post '/rest/account/fake/:_username' do |_username|
  db = DatabaseManager.new
  accounts = db.findAccount(_username)
  affected_rows = accounts.cmd_tuples
  return 404, "Username not found" if affected_rows == 0
  ret = db.updateAccount(_username, 'fake_account', true)
  return 417, ret if ret != 'UPDATED'
  return 200
end

get '/rest/account/:_username/password/:passwordTry' do |_username, passwordTry|
  db = DatabaseManager.new
  ret = db.verifyPasswordAccount(_username, passwordTry)
  return 404, ret if ret == 'Username not found'
  return 417, ret if ret == 'Username not verified'
  return 400, ret[0].to_s if ret[0] === false
  cookie_token = JWT.encode _username, nil, 'none'
  db.updateLastSeen(_username)
  response.set_cookie("username", :value => cookie_token, :domain => false,
					  :path => '/', :expires => Date.today + 3)
  return 200, {:message => ret[0].to_s, :completed => ret[1] }.to_json
end

get '/rest/account/more-infos' do
  db = DatabaseManager.new
  ret = db.findAccount(username)
  return 417, "Username not found" if ret.cmd_tuples == 0
  # Fame
  fame_rating = db.getFameRating(username)
  # likes
  ret = db.findLikesTo(username)
  affected_rows = ret.cmd_tuples
  likes = affected_rows == 0 ? [] : ret.values.map {|a| a[0]}
  # Visits
  ret = db.findVisitsTo(username)
  affected_rows = ret.cmd_tuples
  visits = affected_rows == 0 ? [] : ret.values.map {|a| a[0]}
  return 200, {
    :likes => likes,
    :visits => visits,
    :fameRating => fame_rating
  }.to_json
end

get '/rest/account/fame/:username' do |_username|
  db = DatabaseManager.new
  ret = db.findAccount(_username)
  return 417, "Username not found" if ret.cmd_tuples == 0
  fame_rating = db.getFameRating(_username)
  return 200, fame_rating.to_s
end

post '/rest/account/search' do
  db = DatabaseManager.new
  body = JSON.parse request.body.read
  blockedUsernames = db.getBlockedUsernames(username) + db.getBlockedByUsernames(username)
  notCompleteUsernames = db.getNotCompleteUsernames().join("','")
  query = 'WHERE username NOT IN ' + \
        "('" + username + "','" + blockedUsernames.join("','") + "','" + notCompleteUsernames + "')"
  variables = []
  today = Date.today
  if body['minAge']
    date = Date.new(today.cwyear, 12, 30)
    date = date << (12 * body['minAge'].to_i)
    query += " AND birthday < '" + date.to_s + "'::date"
  end
  if body['maxAge']
    date = Date.new(today.cwyear, 1, 1)
    date = date << (12 * body['maxAge'].to_i)
    query += " AND birthday > '" + date.to_s + "'::date"
  end
  if body['location']
    #We receive geolocation in text and transform it in coordinates
    geolocation = geolocationCoordinates(body['location'])
    return 417, "Wrong geolocation" if geolocation == false
    maxDistance = 15 #We define a range of distance from the coordinates that defines who is inside the location
    query += " AND geolocation<@>'#{geolocation}' <= #{maxDistance.to_s}"
  end
  if body['tags']
    usernames = db.getAvailableFromTags(body['tags']).values.map { |val| val[0]}
    query += ' AND username IN ' + "('" + usernames.join("','") + "')"
  end
  search = db.search(query, variables)
  res = db.getIUserResultsFromArray(username, search)
  if body['minFame'] || body['maxFame']
    res.each {|user|
      if body['minFame'] && user[:fame] < body['minFame'].to_i
        res.delete(user)
      end
      if body['maxFame'] && user[:fame] > body['maxFame'].to_i
        res.delete(user)
      end
    }
  end
  return 200, res.to_json
end

get '/rest/account/suggestions' do
  db = DatabaseManager.new
  geolocation = getGeolocationCoordinates(params[:geolocation], request.ip)
  return 417, "Wrong geolocation" if geolocation == false
  db.updateGeolocation(username, geolocation)
  maxAgeDifference = params[:age]
  maxDistance = params[:location]
  minFame = params[:fame]
  minCommonTags = params[:tags]
  maxAgeDifference = 10 if maxAgeDifference == nil
  maxDistance = 33 if maxDistance == nil
  minFame = -1000 if minFame == nil
  minCommonTags = 0 if minCommonTags == nil
  ret = db.findAccount(username)
  return 404, "Username not found" if ret.cmd_tuples == 0
  age = getAgeInYears(ret[0]['birthday'])
  sug = db.findSuggestionsAccount(ret[0]['username'],
                                  ret[0]['sexual_orientation'], ret[0]['gender'], ret[0]['geolocation'],
                                  age, maxAgeDifference, maxDistance, minFame, minCommonTags)
  return 200, sug.to_json
end

# TOKEN TABLE ROUTES

get '/rest/token/resetPassword/:_username' do |_username|
  db = DatabaseManager.new
  #Get the email of user and verify user exist
  ret = db.findAccount(_username)
  return 417, "Username not found" if ret.cmd_tuples == 0
  email = ret[0]['email']
  #Delete already existing tokens of user
  db.deleteToken(_username)
  #Create and get token
  ret = db.createToken(_username)
  return 417, "Error token creation" unless defined?(ret[1])
  token = ret[1]
  puts(token)
  #send email with token
  return 417, "Mail is not valid" if !send_mail(email, "reset matcha password",
  		  "Click on the following link to reset password: " +
          frontend + "/profile/password/reset/" +
           token)
  return 200
end

get '/rest/token/:token/resetPassword/:newPassword' do |token, newPassword|
  db = DatabaseManager.new
  ret = db.findToken(token)
  return 417, "Token not found" if ret.cmd_tuples == 0
  if Date.parse(ret[0]['expiry_time']) < Date.today
    db.deleteToken(ret[0]['account_id'])
    return 417, "Token is expired"
  end
  db.updateAccount(ret[0]['account_id'], "password", newPassword)
  return 200
end

# BLOCKED TABLE ROUTES

post '/rest/blocked/:blocked' do |blocked|
  db = DatabaseManager.new
  ret = db.createBlocked(username, blocked)
  return 417, ret if ret != 'CREATED'
  return 200, ret
end

# LIKED TABLE ROUTES

post '/rest/liked/:liked' do |liked|
  db = DatabaseManager.new
  ret = db.createLiked(username, liked)
  return 417, ret if ret != 'CREATED'
  if (db.findLiked(liked, username)).cmd_tuples === 0
    db.createNotification(username, liked, "account liked",
                          "account liked by #{username}", "LIKE")
  else
    db.createNotification(username, liked, "account liked back",
                          "account liked back by #{username}", "LIKED_BACK")
  end
  return 200, ret
end

delete '/rest/liked/:liked' do |liked|
  db = DatabaseManager.new
  ret = db.deleteLiked(username, liked)
  affected_rows = ret.cmd_tuples
  return 417, "Like of #{username} to #{liked} not found" if affected_rows == 0
  db.createNotification(username, liked, "account unliked",
                        "account unliked by #{username}", "UNLIKED")
  return 200, ret.cmd_tuples.to_s #Returns the number of removed rows
end

get '/rest/liked/connections' do
  db = DatabaseManager.new
  connections = []

  blockedBy = db.getBlockedByUsernames(username)
  ret = db.findLikesTo(username)
  return 200, [] if ret == nil
  ret.each_row { |row|
    ret2 = db.findLiked(username, row[0])
    if !blockedBy.include?(row[0]) && ret2.cmd_tuples != 0
      connections.push(row[0])
    end
  }
  return 200, connections.to_json
end

# MESSAGE TABLE ROUTE

post '/rest/message/:receiver' do |receiver|
  db = DatabaseManager.new
  body = JSON.parse request.body.read
  if db.isBlockedBy(username, receiver) or !itsMatch(username, receiver)
    return 201, 'CREATED'
  end
  ret = db.createMessage(username, receiver, body['content'])
  return 417, ret if ret != 'CREATED'
  db.createNotification(username, receiver, "message received",
                        "message received from #{username}", "MESSAGE")
  return 201, ret
end

get '/rest/message' do
  db = DatabaseManager.new
  list = []
  ret = db.findMessagesForUser(username)
  list = ret.each.map { |message|
    {
      id: message['id'],
      receiver_id: message['receiver_id'],
      sender_id: message['sender_id'],
      time: message['time'],
      content: message['content']
    }
  }
  return 200, list.to_json
end

# # NOTIFICATION TABLE ROUTES

get '/rest/notification' do
  db = DatabaseManager.new
  ret = db.findNotifications(username)
  list = ret.each.map { |notification|
    {
      id: notification['id'],
      userId: notification['account_id'],
      opened: notification['opened'] == 'f' ? false : true,
      time: Date.parse(notification['time']),
      title: notification['title'],
      content: notification['content'],
      type: notification['notif_type'],
    }
  }
  return 200, list.to_json
end

patch '/rest/notification/:id/:colomnToUpdate/:newValue' do |id, columnToUpdate, newValue|
  db = DatabaseManager.new
  ret = db.updateNotification(id, columnToUpdate, newValue)
  return 417, ret if ret != 'UPDATED'
  return 200, ret
end

# TAG TABLE ROUTES

get '/rest/tag/:tag/similar' do |tag|
  db = DatabaseManager.new
  ret = db.findSimilarTags(tag)
  return 200, ret.values.to_json
end

# PICTURE TABLE ROUTES

post '/rest/picture' do
  db = DatabaseManager.new
  if db.numberPicturesUser(username)[0]['count'].to_i >= 5
    return 400, "Maximum number of pictures for user attained"
  end
  if !params[:file] or !params[:file][:filename]
    return 400, "No file in request to be uploaded"
  end
  FileUtils.mkdir_p("../public/images/#{username}")
  storage_path = "images/#{username}/#{params[:file][:filename]}"
  if File.exists?("../public/" + storage_path)
    return 400, "Filename already exists"
  end
  ret = db.createPicture(username, storage_path)
  return 417, ret if ret != 'CREATED'
  File.open("../public/" + storage_path, "wb") do |f|
    f.write(params[:file][:tempfile].read)
  end
  return 201, storage_path #Return the storage path of created file
end

delete '/rest/picture' do
  db = DatabaseManager.new
  data = JSON.parse request.body.read
  return 400, "No given file storage path" unless data['storage_path']
  storage_path = data['storage_path']
  ret = db.deletePicture(storage_path)
  affected_rows = ret.cmd_tuples
  return 417, "#{storage_path} not found" if affected_rows == 0
  File.delete(storage_path) if File.file?(storage_path)
  return 200, ret.cmd_tuples.to_s #Returns the number of removed rows
end

get '/rest/picture' do
  db = DatabaseManager.new
  ret = db.findPicturesUser(username)
  return 200, ret.values.to_json
  #Returns the storage paths towards locally stored images which start from project root
end

=begin
  HELPER METHODS
=end

helpers do
  # Function takes timestamp string and returns age in year as integer
  def getAgeInYears(dob) #dob stands for date of birth.
    dob = DateTime.parse(dob).to_date
    now = Time.now.utc.to_date
    age = now.year - dob.year - ((now.month > dob.month || (now.month == dob.month && now.day >= dob.day)) ? 0 : 1)
    return age
  end

  def getGeolocationCoordinates(paramGeolocation, requestIp)
    if paramGeolocation
      return geolocationCoordinates(paramGeolocation)
    elsif requestIp != '127.0.0.1' && requestIp != '::1'
      #Because we are on localhost we cannot deduct our location from it
      return geolocationCoordinates(requestIp)
    else
      #https://ifconfig.me/ip gives our ip address.
      #When called from backend it does not give ip of user but of server.
      #To get ip from user it should be called in frontend.
      #However because this project is on localhost whereby server and user are on same address we can call it in backend.
      ip = Net::HTTP.get('ifconfig.me', '/ip')
      coordinates = geolocationCoordinates(ip)
      return coordinates ? coordinates : geolocationCoordinates('Brussels')
    end
  end

  def geolocationCoordinates(ipOrAddress) #Address example: "Hôtel de Ville, 75004 Paris, France"
    geolocation = Geocoder.search(ipOrAddress)
    return false if geolocation.first == nil
    return geolocation.first.coordinates.join(',')
  end

  def send_mail(receiver, subject, content)
    begin
      Pony.mail(
        :to => receiver,
        :from => 'matcha@vanderlynden.eu',
        :subject => subject,
        :body => content,
        :via => :smtp,
        :via_options => {
        :address => 'ssl0.ovh.net',
        :port => '587',
        :user_name => 'matcha@vanderlynden.eu',
        :password => '???', #Ask the actual password to pvanderl, we won't leave it publicly here
        :authentication => :plain
      })
      return true
    rescue
      return false
    end
  end

  # Function takes a line of the account DB and returns an object
  def toAccountObject(
    line,
    tags = [],
    liked = false,
    likes_back = false,
    connected = false,
    pictures = [],
    blocked = false
  )
  geolocation = Geocoder.search(line[11].delete("()").split(','))
  if geolocation.first == nil
    geolocation = "An error occurred, our geolocalization API timed out..."
  else
    geolocation = geolocation.first.address
  end
    {
      'username': line[0],
      'email': line[2],
      'firstname': line[3],
      'lastname': line[4],
      'gender': line[5],
      'sexual_orientation': line[6],
      'biography': line[7],
      'birthday': line[8],
      'last_connected': line[9],
      'profile_picture': line[10],
      'geolocation': geolocation,
      'online': line[12] != "f",
      'fake_account': line[13] != "f",
      'custom_geolocation': line[15] != "f",
      'tags': tags,
      'liked': liked,
      'likes_back': likes_back,
      'connected': connected,
      'blocked': blocked,
      'pictures': pictures
    }
  end

  def itsMatch(userA, userB)
    db = DatabaseManager.new
    liked = db.findLiked(userA, userB).cmd_tuples > 0
    likes_back = db.findLiked(userB, userA).cmd_tuples > 0
    return liked && likes_back
  end

end
