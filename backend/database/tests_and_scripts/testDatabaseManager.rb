require './databaseManager.rb'
require 'colorize'

db = DatabaseManager.new

# Tests on account table
puts 'Tests on account table'.green

puts db.createAccount('artainmo', 'pass', 'hotmail', 'art', 'tai', 'MALE', 'FEMALE', 'dwdw', '2020-12-21', '-87.6,41.9')
puts db.createAccount('someone', 'pass', 'mymail', 'so', 'mo', 'FEMALE', 'MALE', 'dwdw', '2020-12-21', '-87.6,41.9')
puts db.createAccount('pvanderl', 'pass', 'hotmail', 'pi', 'van', 'MALE', 'FEMALE', 'dwdw', '2020-12-21', '-87.6,41.9')

allAccounts = db.findAllAccounts
puts allAccounts.inspect
puts "Second account #{allAccounts[1]['username']}'s email #{allAccounts[1]['email']}"

specificAccount = db.findAccount('artainmo')
puts specificAccount.inspect
puts specificAccount[0]['username']

ret = db.updateAccount('pvanderl', 'email', 'gmail')
puts ret.inspect

specificAccount2 = db.findAccount('pvanderl')
puts specificAccount2.inspect
puts "#{specificAccount2[0]['username']}'s updated email #{specificAccount2[0]['email']}"

ret = db.deleteAccount('pvanderl')
puts ret.inspect

puts db.createAccount('p', 'pass', 'hotmail', 'pi', 'van', 'd332d', 'FEMALE', 'dwdw', '2020-12-21', '-87.6,41.9')
puts db.createAccount('v', 'pass', 'hotmail', 'pi', 'van', 'MALE', 'dwewe', 'dwdw', '2020-12-21', '-87.6,41.9')
ret = db.findAccount('nobody')
puts ret.inspect

ret = db.updateAccount('nobody', 'email', 'icloud')
puts ret.inspect
ret = db.updateAccount('artainmo', 'void', 'icloud')
puts ret.inspect

ret = db.deleteAccount('nobody')
puts ret.inspect

# Tests on blocked table
puts 'Tests on blocked table'.green

puts db.createBlocked('artainmo', 'someone')
puts db.createBlocked('someone', 'artainmo')

res = db.findBlocked('artainmo', 'someone')
puts res.inspect
puts res[0]['blocker_id']

res = db.deleteBlocked('artainmo', 'someone')
puts res.inspect
res = db.deleteBlocked('someone', 'artainmo')
puts res.inspect

puts db.createBlocked('nobody', 'someone')
ret = db.findBlocked('nobody', 'nobody')
puts ret.inspect
ret = db.deleteBlocked('nobody', 'nobody')
puts ret.inspect

puts db.createBlocked('artainmo', 'artainmo')

# Tests on liked table
puts 'Tests on liked table'.green

puts db.createLiked('artainmo', 'someone')
puts db.createLiked('someone', 'artainmo')

res = db.findLiked('artainmo', 'someone')
puts res.inspect
puts res[0]['time']

res = db.findLikesBy('artainmo')
puts res.inspect
puts res[0]['time']

res = db.deleteLiked('artainmo', 'someone')
puts res.inspect
res = db.deleteLiked('someone', 'artainmo')
puts res.inspect

puts db.createLiked('nobody', 'someone')
ret = db.findLiked('nobody', 'nobody')
puts ret.inspect
ret = db.deleteLiked('nobody', 'nobody')
puts ret.inspect

puts db.createLiked('artainmo', 'artainmo')

# Tests on message table
puts 'Tests on message table'.green

puts db.createMessage('artainmo', 'someone', 'Hello')
puts db.createMessage('someone', 'artainmo', 'Hi')

res = db.findMessages('artainmo', 'someone')
puts res.inspect
puts res[0]['time']
puts res[1]['time']

res = db.deleteMessages('artainmo', 'someone')
puts res.inspect

puts db.createMessage('nobody', 'someone', 'heu')
ret = db.findMessages('nobody', 'nobody')
puts ret.inspect
ret = db.deleteMessages('nobody', 'nobody')
puts ret.inspect

puts db.createMessage('artainmo', 'artainmo', 'hmm')

# Tests on visit table
puts 'Tests on visit table'.green

puts db.createVisit('artainmo', 'someone')
puts db.createVisit('someone', 'artainmo')

res = db.findVisitsTo('artainmo')
puts res.inspect
puts res[0]['visiter_id']

res = db.deleteVisits('artainmo')
puts res.inspect

puts db.createVisit('nobody', 'someone')
ret = db.findVisitsTo('nobody')
puts ret.inspect
ret = db.deleteVisits('nobody')
puts ret.inspect

puts db.createVisit('artainmo', 'artainmo')

# Tests on notification table
puts 'Tests on notification table'.green

puts db.createNotification('artainmo', 'new like', 'see new like link', 'LIKE')
puts db.createNotification('artainmo', 'new message', 'see new like link', 'LIKE')

ret = db.findNotifications('artainmo')
puts ret.inspect
puts ret[1]['opened']

r = db.deleteNotification(ret[0]['id'])
puts r.inspect

ret = db.updateNotification(ret[1]['id'], 'opened', true)
puts ret.inspect
ret = db.findNotifications('artainmo')
puts ret[0]['opened']
db.deleteNotification(ret[0]['id'])


puts db.createNotification('nobody', 'new like', 'see new like link', 'LIKE')
puts db.createNotification('artainmo', 'new like', 'see new like link', 'fefewf')
ret = db.findNotifications('nobody')
puts ret.inspect
ret = db.updateNotification('dedew', 'content', 'icloud')
puts ret.inspect
ret = db.updateNotification('6bfacc32-400e-4389-85ff-f000243b1a4d', 'void', 'icloud')
puts ret.inspect
ret = db.deleteNotification('123')
puts ret.inspect

# Tests on tag table
puts 'Tests on tag table'.green

puts db.createTag('artainmo', 'hockey')
puts db.createTag('someone', 'hockey')

ret = db.findTagsOfUser('artainmo')
puts ret[0]['tag']

ret = db.findUsersWithTag('hockey')
puts ret[1]['account_id']

ret = db.deleteTag('artainmo', 'hockey')
puts ret.inspect

puts db.createTag('nobody', 'hockey')
ret = db.findTagsOfUser('dwqqd')
puts ret.inspect
ret = db.findUsersWithTag('basket')
puts ret.inspect

# Tests on picture table
puts 'Tests on picture table'.green

puts db.createPicture('artainmo', 'storage/img.npg')
puts db.createPicture('someone', 'storage/img.png')

ret = db.findPicturesUser('artainmo')
puts ret[0]['storage_path']

ret = db.deletePicture('storage/img.npg')
puts ret.inspect

puts db.createPicture('nobody', 'hockey')
ret = db.findPicturesUser('dwqqd')
puts ret.inspect
