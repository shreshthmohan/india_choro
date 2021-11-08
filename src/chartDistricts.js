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

  // const srValues = censusData.map(d => parseFloat(d.sex_ratio))
  // const srMid = 1000
  // const [srMin, srMax] = d3.extent(srValues)
  // const maxGap = d3.min([srMid - srMin, srMax - srMid])
  // const srDomain = [1000 - maxGap, 1000 + maxGap]

  // const colorScale = d3.scaleSequential(d3.interpolateRdBu).domain(srDomain)

  const metricOptionList = ['sex_ratio', 'literacy', 'Population']
  const colorSchemes = {
    sex_ratio: d3.schemeRdBu[5],
    literacy: d3.schemePuOr[9].slice().reverse(),
    Population: d3.schemeSpectral[9].slice().reverse(),
  }
  const colorInterpolate = {
    sex_ratio: d3.interpolateRdBu,
    literacy: t => d3.interpolatePuOr(1 - t),
    Population: d3.interpolateSpectral,
  }
  // const metricOptionList = [{metric:'sex_ratio', colorScheme}, {metric:'literacy'}, {metric:'Population'}]
  let metric = metricOptionList[1]

  const metricSelect = d3.select('body').append('select').lower()

  const colorScheme = d3.interpolateRdBu

  const metricValues = censusData.map(d => parseFloat(d[metric]))
  const metricDomain = d3.extent(metricValues)
  // const colorScale = d3
  //   .scaleSequential(colorInterpolate[metric])
  //   .domain(metricDomain)
  const colorScale = d3
    .scaleQuantile()
    .domain(metricValues)
    .range(colorSchemes[metric])

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
    (a, b) => a == b,
  )

  const path = d3
    .geoPath()
    // use fitSize to scale, transform shapes to take up the whole available space inside svg
    .projection(
      d3.geoMercator().fitSize([svgWidth, svgHeight], districtsShapeGeo),
    )

  console.log(censusDataObj)

  const districts = svg
    .append('g')
    .selectAll('path')
    .data(districtsShapeGeo.features)
    .join('path')
    .attr('d', path)
    .attr('fill', d => {
      const code = d.properties.censuscode

      if (censusDataObj[code]) {
        return colorScale(censusDataObj[code][metric])
      } else {
        return 'gray'
      }
    })
    .on('mouseover', (e, d) => {
      const { DISTRICT, censuscode, ST_NM } = d.properties

      const { [metric]: m, 'District name': district } =
        censusDataObj[censuscode]
      tooltipDiv.transition().duration(200).style('opacity', 1)
      tooltipDiv.html(
        `(${censuscode}) ${district}/${DISTRICT}, ${ST_NM}: ${metric}: ${m}`,
      )
    })

  metricSelect
    .selectAll('option')
    .data(metricOptionList)
    .join('option')
    .attr('value', d => d)
    .text(d => d)

  metricSelect.on('change', function (e, d) {
    // console.log(e.target.value, d)
    metric = this.value

    const mv = censusData.map(d => parseFloat(d[metric])).sort()
    const md = d3.extent(mv)

    const cs = d3.scaleSequential(colorInterpolate[metric]).domain(md)

    districts.attr('fill', d => {
      const code = d.properties.censuscode

      if (censusDataObj[code]) {
        return cs(censusDataObj[code][metric])
      } else {
        return 'gray'
      }
    })
  })

  svg
    .append('path')
    .attr('pointer-events', 'none')
    .attr('fill', 'none')
    .attr('stroke', '#fefefe')
    .attr('stroke-width', 0.5)
    .attr('d', path(districtMesh))

  svg
    .append('path')
    .attr('pointer-events', 'none')
    .attr('fill', 'none')
    .attr('stroke', '#333')
    .attr('stroke-width', 1)
    .attr('d', path(stateMesh))
})
