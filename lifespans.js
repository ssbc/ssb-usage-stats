var pull = require('pull-stream')
var paramap = require('pull-paramap')

// find the timestamp of the first and last message for all known users
module.exports = function (sbot, cb) {
  pull(
    sbot.latest(),

    // get the timestamp of the last message for all users
    paramap(function (data, cb) {
      // DONT use this, because our .first will be using the msg's declared timestamp, and this is the msg's local receive time
      // if(data.ts) return cb(null, { id: data.id, last: data.ts })

      // handle some legacy: older users may not have .ts included in latest()
      pull(
        sbot.createHistoryStream({id: data.id, sequence: data.sequence  - 1}),
        pull.find(null, function (err, msg) {
          if (err) throw err
          cb(null, { id: data.id, last: msg.value.timestamp })
        })
      )
    }),

    // now get the timestamp of the first message for all users
    paramap(function (user, cb) {
      pull(
        sbot.createHistoryStream({id: user.id, limit: 1}),
        pull.find(null, function (err, msg) {
          if (err) throw err
          user.first = msg.value.timestamp
          user.lifespan = user.last - user.first
          cb(null, user)
        })
      )
    }),

    pull.collect(cb)
  )

}
