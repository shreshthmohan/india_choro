const census2011DistrictsReduced =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSxyga50qbpNOzeccy52LyF696f6Nj66PAI7WWFLuzxI2QMmdF8Hvk5CfFjOTR0tsZOxKEhWfW7TXBR/pub?gid=7310244&single=true&output=csv'

const census2011Districts =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSxyga50qbpNOzeccy52LyF696f6Nj66PAI7WWFLuzxI2QMmdF8Hvk5CfFjOTR0tsZOxKEhWfW7TXBR/pub?gid=1967911996&single=true&output=csv'

const census2011States =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSxyga50qbpNOzeccy52LyF696f6Nj66PAI7WWFLuzxI2QMmdF8Hvk5CfFjOTR0tsZOxKEhWfW7TXBR/pub?gid=778096512&single=true&output=csv'

const districtsTopoJSON = './2011_india_districts.topo.json'
const statesTopoJSON = './2011_india_states.topo.json'

const dataPath = census2011Districts

const district_code_field = 'District code'
const district_name_field = 'District name'

// 1. get topojson
// 2. convert to geojson

const censusDataObj = {}

Promise.all([
  d3.csv(dataPath),
  d3.json(districtsTopoJSON),
  d3.json(statesTopoJSON),
]).then(([censusData, districtsShapeData, statesShapeData]) => {
  // 1. districtsShapeData is in topoJSON format

  // 2. Convert topoJSON to geoJSON (d3 needs geoJSON)
  const districtsShapeGeo = topojson.feature(
    districtsShapeData,
    districtsShapeData.objects['2011_Dist'],
  )
  // Keys will be district codes
  censusData.forEach(dst => {
    censusDataObj[dst[district_code_field]] = dst
  })

  const svgWidth = 630
  const svgHeight = 700

  const tooltipDiv = d3
    .select('body')
    .append('div')
    .attr(
      'class',
      'dom-tooltip absolute text-center bg-white rounded px-2 py-1 text-xs border capitalize',
    )
    .style('opacity', 0)
    .lower()

  const svg = d3.select('#chart-container').append('svg')
  svg.attr('width', svgWidth).attr('height', svgHeight)

  const srValues = censusData.map(d => parseFloat(d.sex_ratio))
  const srMid = 1000
  const [srMin, srMax] = d3.extent(srValues)
  const maxGap = d3.min([srMid - srMin, srMax - srMid])
  const srDomain = [1000 - maxGap, 1000 + maxGap]

  const colorScale = d3.scaleSequential(d3.interpolateRdBu).domain(srDomain)

  const districtMesh = topojson.mesh(
    districtsShapeData,
    districtsShapeData.objects['2011_Dist'],
    // internal boundaries
    // (a, b) => a !== b,
    // external boundaries
    // (a, b) => a == b,
  )

  const stateMesh = topojson.mesh(
    statesShapeData,
    statesShapeData.objects.states,
  )

  const path = d3
    .geoPath()
    // use fitSize to scale, transform shapes to take up the whole available space inside svg
    .projection(
      d3.geoMercator().fitSize([svgWidth, svgHeight], districtsShapeGeo),
    )

  console.log(censusDataObj)

  svg
    .append('g')
    .selectAll('path')
    .data(districtsShapeGeo.features)
    .join('path')
    .attr('d', path)
    .attr('fill', d => {
      const code = d.properties.censuscode

      if (censusDataObj[code]) {
        return colorScale(censusDataObj[code].sex_ratio)
      } else {
        return 'gray'
      }
    })
    .on('mouseover', (e, d) => {
      const { DISTRICT, censuscode, ST_NM } = d.properties

      const { 'sex_ratio': sexRatio, 'District name': district } =
        censusDataObj[censuscode]
      tooltipDiv.transition().duration(200).style('opacity', 1)
      tooltipDiv.html(`${district}(${censuscode}), ${ST_NM}: ${sexRatio}`)
    })

  svg
    .append('path')
    // .attr('pointer-events', 'none')
    .attr('fill', 'none')
    .attr('stroke', '#333')
    .attr('stroke-width', 0.5)
    // .attr('d', path(stateMesh))
    .attr('d', path(districtMesh))
})
