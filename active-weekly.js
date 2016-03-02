var pull = require('pull-stream')
var paramap = require('pull-paramap')
var Window = require('pull-window')


var NOW = Date.now()
var DAY = 1000*60*60*24
var WEEK = DAY*7

function zero (sample, ts) {
  return {sample: sample, ts: ts, users: {}, interactions: 0}
}

module.exports = function (ssb, cb) {
  var current = 0, _cb, sample = 0
  var acc = zero()

  var range = WEEK

  pull(
    ssb.createLogStream({meta: true}),

    Window(function (data, cb) {
      if(!data.timestamp) throw new Error('weird')
      var before = data.timestamp
      if(before > current + range) {
        _cb && _cb(null, acc)
        while(before > current + range) current += range
        _cb = cb
        acc = zero(sample, current)
        sample ++
        return function (end, data) {
          if(end) return _cb && _cb(null, acc)
          acc.interactions ++
          acc.users[data.value.author] = true
        }
      }
    }, function (_, acc) {
      acc.users = Object.keys(acc.users).length
      return acc
    }),

    pull.collect(cb)
  )
}
