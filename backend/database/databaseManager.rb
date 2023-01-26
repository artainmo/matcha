=begin
  To install pg use this command:
    gem install pg -- --with-pg-config=<path to pg_config>
  To find path to pg_config:
    sudo find / -name "pg_config" 2>/dev/null | head -n 1
=end
require 'pg'
require 'time'
require 'securerandom'
require 'bcrypt'
require 'digest'
require 'geocoder'
require 'fileutils'

count = 0

class DatabaseManager
  def initialize
    begin
      puts 'Connecting to database...'
      #Run a postgres server and matcha database with https://postgresapp.com on macos
      @conn = PG.connect({
        host: 'localhost',
        port: '5432',
        dbname: 'matcha',
        user: 'postgres',
        password: 'admin'
      })
    rescue PG::ConnectionBad => error
      if error.message[48,39] == "FATAL:  sorry, too many clients already"
        sleep(0.5)
        count += 1
        if count >= 10
          exit
        end
        initialize
      else
        puts error.message
        exit
      end
    end
  end

  def createDatabase
    puts 'Creating the database...'
    create_db_commands = File.read(__dir__ + '/designDatabase.sql')
    begin
      @conn.exec(create_db_commands)
    rescue PG::Error => error
      if error.message[0..-2] == 'ERROR:  relation "account" already exists'
        puts 'Database exists already!'
      else
        print error.message
        exit
      end
    else
      puts 'Database created!'
    end
  end

=begin
  The following methods return a boolean or
  the object https://deveiate.org/code/pg/PG/Result.html
=end

# Queries on account table

  def createAccount(username, password, email, firstname,
                  lastname)
    puts "Create #{username}'s account..."
    crypted_password = BCrypt::Password.create(password).encode
    begin
      @conn.exec_params('INSERT INTO account
        (username, password, email, firstname, lastname)
         VALUES ($1, $2, $3, $4, $5);',
          [username, crypted_password, email, firstname, lastname])
    rescue PG::Error => error
      puts error.message
      if error.message[0,69] == 'ERROR:  duplicate key value violates unique constraint "account_pkey"'
        return "username already in use"
      end
      return error.message
    else
      return 'CREATED'
    end
  end

  def findAccount(username)
    puts "Find #{username}'s account..."
    return @conn.exec_params('SELECT * FROM account WHERE username = $1;', [username])
  end

  def deleteAccount(username)
    puts "Delete #{username}'s account..."
    return @conn.exec_params('DELETE FROM account WHERE username = $1;', [username])
  end

  def updateAccount(username, columnToUpdate, newValue)
    print "Update #{username}'s account with new value #{newValue} " +
          "in column #{columnToUpdate}\n"
	  if (columnToUpdate === "password")
    	newValue = BCrypt::Password.create(newValue).encode
    end
    begin
      ret = @conn.exec_params("UPDATE account SET #{columnToUpdate} = $1
          WHERE username = $2;", [newValue, username]);
      raise PG::Error.new "Username not found" if ret.cmd_tuples == 0
    rescue PG::Error => error
      puts error.message
      return error.message
    else
      return 'UPDATED'
    end
  end

  def updateGeolocation(username, location)
    begin
      @conn.exec_params("UPDATE account SET geolocation = $1
          WHERE username = $2 AND custom_geolocation = false;", [location, username])
    rescue PG::Error => error
      puts error.message
      return error.message
    else
      return 'UPDATED'
    end
  end

  def verifyPasswordAccount(username, passwordTry)
    puts "Verify if #{passwordTry} is the correct password of #{username}..."
    ret = findAccount(username)
    return 'Username not found' if ret.cmd_tuples == 0
    return 'Username not verified' if ret[0]['verified'] == 'f'
    return BCrypt::Password.new(ret[0]['password']).is_password?(passwordTry), is_completed(ret[0])
  end

  def verifyAccount(username)
    ret = findAccount(username)
    return 'Username not found' if ret.cmd_tuples == 0
    return @conn.exec_params('UPDATE account SET verified = true WHERE username = $1;', [username])
  end

  def updateLastSeen(username)
    puts "Update last time connected of #{username}"
    @conn.exec_params('UPDATE account SET last_connected = $1 WHERE username = $2;', [Time.now(), username])
  end

  def getNotCompleteUsernames()
    ret = @conn.exec_params('SELECT username FROM account WHERE birthday IS NULL;')
    return ret.cmd_tuples == 0 ? [] : ret.values.map {|a| a[0]}
  end

  def getFameRating(username)
    puts "Get fame rating of #{username}"
    likes = (findLikesTo(username)).cmd_tuples
    visits = (findVisitsTo(username)).cmd_tuples
    messages = findNumberMessagesTo(username)[0]['count'].to_i
    blocks = findNumberBlockedTo(username)[0]['count'].to_i
    if visits == 0 #Prevent bug of dividing non-zero by zero equaling infinity
      visitsToLikesRatio = 0
    else
      visitsToLikesRatio = likes.to_f / visits.to_f
    end
    sum = (likes * 90) + (visits * 10) + (messages * 25) - (blocks * 300)
    sumPartial = ((sum * visitsToLikesRatio).ceil).abs
    return sum + sumPartial
  end

  def findSuggestionsAccount(username, sexualOrientation, gender, geolocation,
        age, maxAgeDifference, maxDistance, minFame, minCommonTags)
    puts "Find partner suggestions for account #{username} " + \
    "with sexual orientation #{sexualOrientation}, gender #{gender}, geolocation #{geolocation}, " + \
    "age #{age}, max age difference #{maxAgeDifference}, max distance #{maxDistance}, " + \
    "minimum fame #{minFame}, minimum common tags #{minCommonTags}...."
    blockedUsernames = getBlockedUsernames(username) + getBlockedByUsernames(username)
    notCompleteUsernames = getNotCompleteUsernames().join("','")
    start_sql = "SELECT * FROM account WHERE username NOT IN " + \
          "('" + username + "','" + blockedUsernames.join("','") + "','" + notCompleteUsernames + "') "
    sexualOrientation_sql = "AND (sexual_orientation = 'OTHER' OR sexual_orientation = 'BI' OR sexual_orientation = '#{gender}') "
    if sexualOrientation == 'MALE' or sexualOrientation == 'FEMALE'
      sexualOrientation_sql = "AND gender = '#{sexualOrientation}' " + sexualOrientation_sql
    end
    location_sql = "AND geolocation<@>'#{geolocation}' <= #{maxDistance.to_s} " #Distance is calculated in miles
    age_sql = "AND abs(EXTRACT(YEAR FROM AGE(birthday)) - '#{age}') <= #{maxAgeDifference.to_s};"
    ret = @conn.exec_params(start_sql + sexualOrientation_sql + location_sql + age_sql)
    return [] if ret.cmd_tuples == 0
    ret = filterSuggestionsWithTagsAndFame(username, ret, minCommonTags, minFame)
    return ret #Returns double array instead of PG::Result object
  end

  def search(query, variables)
    @conn.exec_params('SELECT * FROM account ' + query + ' ;', variables)
  end

  def getAvailableFromTags(tags)
    @conn.exec_params("SELECT account_id FROM (
    SELECT account_id, COUNT(tag)
    FROM public.tag
    where tag IN ('" + tags.join("','") + "')	GROUP BY account_id
    ) as res
    WHERE res.count = $1", [ tags.length])
  end

# Queries on token table

  #https://security.stackexchange.com/questions/213975/how-to-properly-create-a-password-reset-token
  def createToken(username)
    puts "Create token for #{username}..."
    token = SecureRandom.base64(16);
    token.delete! '!*\'();:@&=+$,/?%#[]'
    expiry_time = Time.now() + (60 * 60 * 24) #24h later
    begin
      @conn.exec_params('INSERT INTO token (hashed_token, account_id, expiry_time)
                        VALUES ($1, $2, $3);', [token, username, expiry_time])
    rescue PG::Error => error
      puts error.message
      return error.message
    else
      return ['CREATED', token]
    end
  end

  def deleteToken(username)
    puts "Delete token of #{username}..."
    return @conn.exec_params('DELETE FROM token WHERE account_id = $1;', [username])
  end

  def findToken(token)
    puts "Find token #{token}..."
    return @conn.exec_params('SELECT * FROM token WHERE hashed_token = $1;', [token])
  end

# Queries on blocked table

  def createBlocked(blocker, blocked)
    puts "Create block of #{blocked} by #{blocker}..."
    begin
      @conn.exec_params('INSERT INTO blocked (blocker_id, blocked_id)
                        VALUES ($1, $2);', [blocker, blocked])
    rescue PG::Error => error
      puts error.message
      return error.message
    else
      return 'CREATED'
    end
  end

  def getBlockedUsernames(blocker)
    ret = @conn.exec_params('SELECT * FROM blocked
                              WHERE blocker_id = $1;', [blocker])
    affected_rows = ret.cmd_tuples
    affected_rows == 0 ? [] : ret.values.map {|a| a[1]}
  end

  def getBlockedByUsernames(blocked)
    ret = @conn.exec_params('SELECT * FROM blocked
                              WHERE blocked_id = $1;', [blocked])
    affected_rows = ret.cmd_tuples
    affected_rows == 0 ? [] : ret.values.map {|a| a[0]}
  end

  def findNumberBlockedTo(blocked)
    puts "Find number of accounts that blocked #{blocked}..."
    return @conn.exec_params('SELECT COUNT(*) FROM blocked
                              WHERE blocked_id = $1;', [blocked])
  end

  def isBlockedBy(blocked, blocker)
    ret = @conn.exec_params('SELECT * FROM blocked
                              WHERE blocker_id = $1 AND blocked_id = $2;', [blocker, blocked])
    affected_rows = ret.cmd_tuples
    affected_rows != 0
  end

# Queries on liked table

  def createLiked(liker, liked)
    puts "Create like of #{liked} by #{liker}..."
    begin
      @conn.exec_params('INSERT INTO liked (liker_id, liked_id, time)
                        VALUES ($1, $2, $3);', [liker, liked, Time.now()])
    rescue PG::Error => error
      puts error.message
      return error.message
    else
      return 'CREATED'
    end
  end

  def deleteLiked(liker, liked)
    puts "Delete liked #{liked} by #{liker}..."
    return @conn.exec_params('DELETE FROM liked WHERE liker_id = $1
                             AND liked_id = $2;', [liker, liked])
  end

  def findLiked(liker, liked)
    puts "Find liked #{liked} by #{liker}..."
    return @conn.exec_params('SELECT * FROM liked WHERE liker_id = $1
                            AND liked_id = $2;', [liker, liked])
  end

  def findLikesTo(liked)
    puts "Find likes to #{liked}..."
    @conn.exec_params('SELECT * FROM liked WHERE liked_id = $1;', [liked])
  end

# Queries on message table

  def createMessage(sender, receiver, content)
    puts "Create message from #{sender} to #{receiver} with content: '#{content}'..."
    begin
      @conn.exec_params('INSERT INTO message
                        (id, sender_id, receiver_id, content, time)
                        VALUES ($1, $2, $3, $4, $5);',
                        [SecureRandom.uuid, sender, receiver, content, Time.now()])
    rescue PG::Error => error
      puts error.message
      return error.message
    else
      return 'CREATED'
    end
  end

  def findMessagesForUser(username)
    puts "Find all messages from #{username}"
    return @conn.exec_params('SELECT * FROM message WHERE
                            sender_id = $1 OR receiver_id = $1
                            ORDER BY time;', [username])
  end

  def findNumberMessagesTo(receiver)
    puts "Find number of messages to #{receiver}..."
    return @conn.exec_params('SELECT COUNT(*) FROM message
                              WHERE receiver_id = $1', [receiver])
  end

# Queries on visit table

  def createVisit(visiter, visited)
    if visitExists(visiter, visited)
      return 'CREATED'
    end
    puts "Create visit from #{visiter} to #{visited}..."
    begin
      @conn.exec_params('INSERT INTO visit
                        (visiter_id, visited_id, time)
                        VALUES ($1, $2, $3);',
                        [visiter, visited, Time.now()])
    rescue PG::Error => error
      puts error.message
      return error.message
    else
      return 'CREATED'
    end
  end

  def visitExists(visiter, visited)
    ret = @conn.exec_params('SELECT * FROM visit WHERE visiter_id = $1 AND visited_id = $2;', [visiter, visited])
    affected_rows = ret.cmd_tuples
    return affected_rows > 0
  end

  def findVisitsTo(visited)
    puts "Find visits to #{visited}..."
    return @conn.exec_params('SELECT * FROM visit WHERE visited_id = $1;', [visited])
  end

# Queries on notification table

  def createNotification(sender, account, title, content, notif_type)
    if isBlockedBy(sender, account)
      return 'CREATED'
    end
    puts "Create notification for #{account}..."
    begin
      @conn.exec_params('INSERT INTO notification
        (id, account_id, time, title, content, notif_type)
        VALUES ($1, $2, $3, $4, $5, $6);', [SecureRandom.uuid,
        account, Time.now(), title, content, notif_type])
    rescue PG::Error => error
      puts error.message
      return error.message
    else
      return 'CREATED'
    end
  end

  def findNotifications(account)
    puts "Find #{account}'s notifications..."
    return @conn.exec_params('SELECT * FROM notification
                            WHERE account_id = $1
                            ORDER BY time DESC;', [account])
  end

  def updateNotification(id, columnToUpdate, newValue)
    puts "Update notification #{id}'s column '#{columnToUpdate}' with '#{newValue}'"
    begin
      ret = @conn.exec_params("UPDATE notification SET #{columnToUpdate} = $1
          WHERE id = $2;", [newValue, id]);
      raise PG::Error.new "Notification id not found" if ret.cmd_tuples == 0
    rescue PG::Error => error
      puts error.message
      return error.message
    else
      return 'UPDATED'
    end
  end

# Queries on tag table

  def createTag(account, tag)
    puts "Create tag #{tag} for #{account}..."
    begin
      @conn.exec_params('INSERT INTO tag (account_id, tag)
        VALUES ($1, $2);', [account, tag])
    rescue PG::Error => error
      puts error.message
      return error.message
    else
      return 'CREATED'
    end
  end

  def deleteTagsOfUser(account)
    puts "Delete tags from account #{account}..."
    return @conn.exec_params('DELETE FROM tag WHERE account_id = $1;', [account])
  end

  def findTagsOfUser(account)
    puts "Find all tags of #{account}"
    return @conn.exec_params('SELECT * FROM tag WHERE account_id = $1;', [account])
  end

  def findSimilarTags(tag)
    puts "Find all tags ressembling #{tag}"
    return @conn.exec("SELECT DISTINCT tag FROM tag WHERE tag LIKE '%#{tag}%'")
  end

  def numberCommonTags(tags1, tags2)
    num = 0
    tags1.each_row { |row|
      tags2.each_row { |row2|
        num += 1 if (row[1] = row2[1])
      }
    }
    return num
  end

  # Queries on picture table

    def createPicture(account, storage_path)
      puts "Create picture in #{storage_path} for #{account}..."
      begin
        @conn.exec_params('INSERT INTO picture (storage_path, account_id)
          VALUES ($1, $2);', [storage_path, account])
      rescue PG::Error => error
        puts error.message
        return error.message
      else
        return 'CREATED'
      end
    end

    def deletePicture(storage_path)
      puts "Delete picture #{storage_path}..."
      return @conn.exec_params('DELETE FROM picture WHERE storage_path = $1;',
                                [storage_path])
    end

    def findPicturesUser(account)
      puts "Find all pictures of #{account}"
      return @conn.exec_params('SELECT * FROM picture WHERE account_id = $1;',
                                [account])
    end

    def numberPicturesUser(account)
      puts "Find number of pictures of #{account}"
      return @conn.exec_params('SELECT COUNT(storage_path) FROM picture
                                WHERE account_id = $1;', [account])
    end

  # Other useful functions

  def deleteDatabase
    puts 'Deleting the database...'
    tables = 'picture, notification, message, token, tag, visit, blocked, liked, account'
    begin
      @conn.exec("DROP TABLE #{tables}")
    rescue PG::Error => error
      if error.message[0..-2] == 'ERROR:  table "picture" does not exist'
        puts "The database is already clean"
      else
        puts error.message
        return error.message
      end
    else
        puts "Database is empty now"
    end
    # Also clean all the locally stored images
    Dir.foreach(__dir__ + "/../../public/images/") { |x|
      if x != '.' and x != '..' and x != '.gitkeep'
        FileUtils.rm_rf(__dir__ + "/../../public/images/#{x}")
      end
    }
    puts "We also removed all locally stored images"
  end

  def createFullAccountForTestPurposes(username, password, email, firstname,
                  lastname, gender, sexual_orientation, biography, birthday,
                  last_connected, geolocation, tag)
    puts "\033[1;33mCreate complete account of name '#{username}' for test purposes...\033[0m"
    puts "With following values:\033[0;33m\nfirstname: #{firstname}\nlastname: #{lastname}"
    puts "gender: #{gender}\nsexual_orientation: #{sexual_orientation}"
    puts "biography: #{biography}\nbirthday: #{birthday}"
    puts "last_connected:#{last_connected}\ngeolocation: #{geolocation}\ntag: #{tag}\033[0m"
    #Encrypt password
    crypted_password = BCrypt::Password.create(password).encode
    #Insert most values into account table database
    begin
      @conn.exec_params('INSERT INTO account
        (username, password, email, firstname, lastname, gender,
        sexual_orientation, biography, birthday, last_connected, geolocation,
        verified, custom_geolocation) VALUES ($1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13);',
          [username, crypted_password, email, firstname, lastname, gender,
             sexual_orientation, biography, birthday, last_connected,
             geolocation, true, true])
    rescue PG::Error => error
      puts error.message
      return error.message
    else
      #Setup profile image
      FileUtils.mkdir_p(__dir__ + "/../../public/images/#{username}")
      storage_path = "images/#{username}/#{gender}.jpg"
      if (ret = createPicture(username, storage_path)) != 'CREATED'
        deleteAccount(username)
        return ret
      end
      FileUtils.cp(__dir__ + "/tests_and_scripts/resources/#{gender}.jpg",
            __dir__ + "/../../public/images/#{username}")
      if (ret = updateAccount(username, 'profile_picture', storage_path)) != 'UPDATED'
        deleteAccount(username)
        return ret
      end
      #Create tag of user
      if (ret = createTag(username, tag)) != 'CREATED'
        deleteAccount(username)
        return ret
      end
      puts "\033[0;32mUSER CREATED\033[0m"
      return 'CREATED'
    end
  end

  def getIUserResultsFromArray(currentUser, pgResult)
    currentUserLocation = findAccount(currentUser)[0]['geolocation']
    currentUserTags = findTagsOfUser(currentUser)
    pgResult.each_with_index.map { |user, index|
      distance = Geocoder::Calculations::distance_between(user['geolocation'].delete("()").split(','), currentUserLocation.delete("()").split(','))
      if distance.nan?
        distance = -1;
      end
      fame = getFameRating(user['username']).to_i
      {
        'username': user['username'],
        'firstname': user['firstname'],
        'lastname': user['lastname'],
        'birthday': user['birthday'],
        'order': index,
        'numberOfTags': numberCommonTags(currentUserTags, findTagsOfUser(user['username'])), #number of common tags
        'fame': fame,
        'distance': distance, #distance between the logged in user and the other user
        'fake_account': user['fake_account']
      }
    }
  end

# Private helper methods
private
    def is_completed(account)
      account['birthday'] != nil && !account['birthday'].empty?
    end

    def filterSuggestionsWithTagsAndFame(username, sug, minCommonTags, minFame)
      result = getIUserResultsFromArray(username, sug)
      filtered_suggestions = []

      result.each { |val|
        next if minCommonTags.to_i > val[:numberOfTags] or minFame.to_i > val[:fame]
        if filtered_suggestions.empty?
          filtered_suggestions.push(val)
        else
          filtered_suggestions.each_with_index { |fil_sug, index|
            if fil_sug[:numberOfTags] < val[:numberOfTags] or
              (fil_sug[:numberOfTags] == val[:numberOfTags] and fil_sug[:fame] < val[:fame])
                filtered_suggestions.insert(index, val)
                break
            elsif index + 1 == filtered_suggestions.length
              filtered_suggestions.push(val)
              break
            end
          }
        end
      }
      return filtered_suggestions
    end
end
