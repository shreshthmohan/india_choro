// not used, kept for future reference

const fs = require('fs')
const topojson = require('topojson')

const tjs = fs.readFileSync('./2011_india_districts_states.topo.json', {
  encoding: 'utf-8',
})
const statesTopo = JSON.parse(tjs)
const statesGeo = topojson.feature(statesTopo, statesTopo.objects.states)
const onlyStatesTopo = topojson.topology({ states: statesGeo })

fs.writeFileSync('2011_india_states.topo.json', JSON.stringify(onlyStatesTopo))
