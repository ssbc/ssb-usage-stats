var pull = require('pull-stream')
var paramap = require('pull-paramap')
var related = false

var DAY = 1000*60*60*24
var Now = Date.now()

var ranges = {
  day: Now - DAY,
  midweek: Now - DAY*3,
  week: Now - DAY*7,
  month: Now - DAY*30,
  forever: 0
}

//roughly calculate active daily, midweek, week, monthy users
module.exports = function (ssb, cb) {
  pull(
    ssb.latest(),
    paramap(function (data, cb) {
      if(data.ts) return cb(null, data)
      pull(
        ssb.createHistoryStream({id: data.id, sequence: data.sequence  - 1}),
        pull.find(null, function (err, msg) {
          data.ts = msg.value.timestamp
          cb(null, data)
        })
      )
    }),
    pull.reduce(function (acc, item) {
      for(var range in ranges) {
        if(item.ts > ranges[range]) {
          acc[range] = (acc[range] || 0) + 1
        }
      }
      return acc
    }, {day: 0, midweek:0, week: 0, month: 0, forever: 0}, cb)
  )

}
