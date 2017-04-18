var pull = require('pull-stream')

module.exports = function (ssb, cb) {
  var activity = []
  var users = {}
  var beginDay = Math.floor(Date.now() /86400000)
  var numUsers = 0
  var userIds = []
  var userNames = []
  var userImages = []
  var too_old = +new Date('2015-01-01')

  pull(
    ssb.createFeedStream(),
    pull.filter(function (data) {
      return data.value.timestamp > too_old
    }),
    pull.collect(function (err, ary) {
      if(err) return cb(err)
      for(var i = 0; i < ary.length ; i++) {
        var day = Math.floor(ary[i].value.timestamp / 86400000)
        if(day < beginDay) {
          console.error(ary[i], new Date(ary[i].value.timestamp))
          beginDay = day //Math.floor(Math.min(,  beginDay))
        }
      }
      console.error('beginDay', beginDay)

      ary.forEach(function (msg) {
        if(!msg.value.timestamp) throw new Error('weird')
        var day = Math.floor(msg.value.timestamp / 86400000)
//        if (!beginDay) beginDay = day
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
      })
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








