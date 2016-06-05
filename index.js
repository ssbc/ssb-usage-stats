var argv = require('yargs').argv
var ssbc = require('ssb-client')

var cmds = {
  'active-timespans': require('./active-timespans'),
  'active-weekly': require('./active-weekly'),
  'active-daily': require('./active-daily'),
  'lifespans': require('./lifespans')
}
var cmd = cmds[argv._[0]]
if (!cmd)
  return usage()

ssbc(function (err, ssb) {
  if (err) throw err
  cmd(ssb, function (err, res) {
    if (err) throw err
    console.log(JSON.stringify(res))
    ssb.close()
  })
})

function usage () {
  console.log('node index.js {'+Object.keys(cmds).join('|')+'}')
  console.log('  active-timespans: number of active users, for a set of past time intervals')
  console.log('  active-weekly: number of active users, per week')
  console.log('  active-daily: daily activity and stuff')
  console.log('  lifespans: how long users are staying active (retention)')
}
