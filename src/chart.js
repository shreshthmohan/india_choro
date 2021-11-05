const census2011Reduced =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSxyga50qbpNOzeccy52LyF696f6Nj66PAI7WWFLuzxI2QMmdF8Hvk5CfFjOTR0tsZOxKEhWfW7TXBR/pub?gid=7310244&single=true&output=csv'

const geoJSON = './2011_india_districts.geo.json'
const topoJSON = './2011_india_districts.topo.json'

const dataPath = census2011Reduced
const shapeJSONPath = topoJSON

// 1. get topojson
// 2. convert to geojson

Promise.all([d3.csv(dataPath), d3.json(shapeJSONPath)]).then(
  ([censusData, shapeData]) => {
    // 1. shapeData is in topoJSON format

    // 2. Convert topoJSON to geoJSON (d3 needs geoJSON)
    const shapeGeo = topojson.feature(shapeData, shapeData.objects['2011_Dist'])

    const svg = d3.select('#chart-container').append('svg')
    svg.attr('width', 900).attr('height', 700)

    svg
      .append('g')
      .selectAll('path')
      .data(shapeGeo.features)
      .join('path')
      .attr(
        'd',
        // use fitSize to scale, transform shapes to take up the whole available space inside svg
        d3.geoPath().projection(d3.geoMercator().fitSize([900, 700], shapeGeo)),
      )
      .attr('fill', 'transparent')
      .attr('stroke', 'red')
  },
)
