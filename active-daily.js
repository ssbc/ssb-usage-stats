var pull = require('pull-stream')

module.exports = function (ssb, cb) {
  var activity = []
  var users = {}
  var beginDay
  var numUsers = 0
  var userIds = []
  var userNames = []
  var userImages = []

  pull(
    ssb.createFeedStream(),
    pull.drain(function (msg) {
      if(!msg.value.timestamp) throw new Error('weird')
      var day = Math.floor(msg.value.timestamp / 86400000)
      if (!beginDay) beginDay = day
      day -= beginDay
      var usersA = activity[day] || (activity[day] = [])
      var author = msg.value.author
      if (!(author in users)) {
        userIds[numUsers] = author
        users[author] = numUsers++
      }
      var userI = users[author]
      usersA[userI] = true
      var c = msg.value.content
      if (c && c.type == 'about' && c.about == author) {
        if (c.name) userNames[userI] = c.name
        if (c.image) userImages[userI] = c.image.link
      }
    }, function (err) {
      if (err) return cb(err)
      cb(null, {
        beginDay: beginDay,
        activity: activity,
        users: userIds,
        names: userNames,
        images: userImages
      })
    })
  )
}
