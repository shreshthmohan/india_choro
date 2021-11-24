const census2011DistrictsReduced =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSxyga50qbpNOzeccy52LyF696f6Nj66PAI7WWFLuzxI2QMmdF8Hvk5CfFjOTR0tsZOxKEhWfW7TXBR/pub?gid=7310244&single=true&output=csv'

const census2011Districts =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSxyga50qbpNOzeccy52LyF696f6Nj66PAI7WWFLuzxI2QMmdF8Hvk5CfFjOTR0tsZOxKEhWfW7TXBR/pub?gid=1967911996&single=true&output=csv'

// const census2011DistrictsLocal = './data/india-districts-census-2011.csv'
const census2011DistrictsLocal = './data/india-districts-census-2011_pc.csv'

const census2011States =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSxyga50qbpNOzeccy52LyF696f6Nj66PAI7WWFLuzxI2QMmdF8Hvk5CfFjOTR0tsZOxKEhWfW7TXBR/pub?gid=778096512&single=true&output=csv'

const districtsTopoJSON = './2011_india_districts_states.topo.json'

const dataPath = census2011DistrictsLocal

const district_code_field = 'District code'
const district_name_field = 'District name'

// 1. get topojson
// 2. convert to geojson

const censusDataObj = {}

Promise.all([
  d3.csv(dataPath),
  d3.json(districtsTopoJSON),
  // d3.json(statesTopoJSON),
]).then(([censusData, districtsShapeData]) => {
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

  const chartContainer = d3.select('#chart-container')
  chartContainer.style('position', 'relative')
  const tooltipDiv = chartContainer
    .append('div')

    .attr(
      'style',
      'position: absolute; opacity: 0; top: 0; right: 0; padding: 8px 10px; border: 1px solid #777; border-radius: 4px; background: white',
    )
    .lower()

  const marginTop = 0
  const marginRight = 0
  const marginBottom = 0
  const marginLeft = 0

  const aspectRatio = 9 / 10

  const coreChartWidth = 1000

  const coreChartHeight = coreChartWidth / aspectRatio

  const viewBoxHeight = coreChartHeight + marginTop + marginBottom
  const viewBoxWidth = coreChartWidth + marginLeft + marginRight

  // .style('background', bgColor)

  const widgets = chartContainer
    .append('div')
    .attr(
      'style',
      'display: flex; justify-content: space-between; padding-bottom: 1rem;',
    )
  const widgetsLeft = widgets
    .append('div')
    .attr('style', 'display: flex; align-items: end; column-gap: 5px;')

  const svg = chartContainer
    .append('svg')
    .attr('viewBox', `0 0 ${viewBoxWidth} ${viewBoxHeight}`)

  const metricOptionList = [
    'sex ratio',
    'literacy rate',
    'Population',
    'SC_percentage',
    'ST_percentage',
    'Hindus_percentage',
    'Muslims_percentage',
    'Christians_percentage',
    'Sikhs_percentage',
    'Buddhists_percentage',
    'Jains_percentage',
    'Others_Religions_percentage',
    'Religion_Not_Stated_percentage',
    'Workers_percentage',
  ]

  const metricValues = {}

  metricOptionList.forEach(m => {
    metricValues[m] = []
  })

  censusData.forEach(d => {
    metricOptionList.forEach(m => {
      d[m] = parseFloat(d[m])
      metricValues[m].push(parseFloat(d[m]))
    })
  })

  const srValues = metricValues['sex ratio']
  const srMid = 1000
  const [srMin, srMax] = d3.extent(srValues)
  const maxGap = d3.min([srMid - srMin, srMax - srMid])
  const srDomain = [1000 - maxGap, 1000 + maxGap]

  const colorScaleSexRatio = d3
    .scaleSequential(d3.interpolateRdBu)
    .domain(srDomain)

  const colorScales = {
    'sex ratio': colorScaleSexRatio,

    'literacy rate': d3
      .scaleSequential(d3.interpolatePuOr)
      .domain(d3.extent(metricValues['literacy rate']).slice().reverse()),

    'Population': d3
      .scaleSequential(d3.interpolateSpectral)
      .domain(d3.extent(metricValues['Population']).slice().reverse()),

    'SC_percentage': d3
      .scaleSequential(d3.interpolateGreens)
      .domain(d3.extent(metricValues['SC_percentage'])),

    'ST_percentage': d3
      .scaleSequential(d3.interpolateOranges)
      .domain(d3.extent(metricValues['ST_percentage'])),

    'Hindus_percentage': d3
      .scaleSequential(d3.interpolateBlues)
      .domain(d3.extent(metricValues['Hindus_percentage'])),
    'Muslims_percentage': d3
      .scaleSequential(d3.interpolateGreens)
      .domain(d3.extent(metricValues['Muslims_percentage'])),

    'Christians_percentage': d3
      .scaleSequential(d3.interpolateBlues)
      .domain(d3.extent(metricValues['Christians_percentage'])),

    'Sikhs_percentage': d3
      .scaleSequential(d3.interpolateBlues)
      .domain(d3.extent(metricValues['Sikhs_percentage'])),

    'Buddhists_percentage': d3
      .scaleSequential(d3.interpolateGreys)
      .domain(d3.extent(metricValues['Buddhists_percentage'])),

    'Jains_percentage': d3
      .scaleSequential(d3.interpolatePurples)
      .domain(d3.extent(metricValues['Jains_percentage'])),

    'Others_Religions_percentage': d3
      .scaleSequential(d3.interpolateOranges)
      .domain(d3.extent(metricValues['Others_Religions_percentage'])),

    'Religion_Not_Stated_percentage': d3
      .scaleSequential(d3.interpolateOranges)
      .domain(d3.extent(metricValues['Religion_Not_Stated_percentage'])),

    'Workers_percentage': d3
      .scaleSequential(d3.interpolateBuGn)
      .domain(d3.extent(metricValues['Workers_percentage'])),
  }

  // const metricOptionList = [{metric:'sex_ratio', colorScheme}, {metric:'literacy'}, {metric:'Population'}]
  let metric = metricOptionList[0]

  const metricSelect = widgetsLeft
    .append('select')
    // .attr('style', 'font-size: 20px')
    .lower()

  const districtMesh = topojson.mesh(
    districtsShapeData,
    districtsShapeData.objects['2011_Dist'],
    // internal boundaries
    // (a, b) => a !== b,
    // external boundaries
    // (a, b) => a == b,
  )

  const stateMesh = topojson.mesh(
    districtsShapeData,
    districtsShapeData.objects.states,
    // (a, b) => a !== b,
  )

  const path = d3
    .geoPath()
    // use fitSize to scale, transform shapes to take up the whole available space inside svg
    .projection(
      d3
        .geoMercator()
        .fitSize([viewBoxWidth, viewBoxHeight], districtsShapeGeo),
    )

  // const statesShapeGeo = topojson.feature(
  //   statesShapeData,
  //   statesShapeData.objects.states,
  // )

  // const pathState = d3
  //   .geoPath()
  //   // use fitSize to scale, transform shapes to take up the whole available space inside svg
  //   .projection(d3.geoMercator().fitSize([svgWidth, svgHeight], statesShapeGeo))

  const districts = svg
    .append('g')
    .selectAll('path')
    .data(districtsShapeGeo.features)
    .join('path')
    .attr('d', path)
    .attr('fill', d => {
      const code = d.properties.censuscode

      if (censusDataObj[code]) {
        return colorScaleSexRatio(censusDataObj[code][metric])
      } else {
        return 'gray'
      }
    })
    .on('mouseover', function (e, d) {
      const { DISTRICT, censuscode, ST_NM } = d.properties

      const { [metric]: m, 'District name': district } =
        censusDataObj[censuscode]
      tooltipDiv.transition().duration(200).style('opacity', 1)
      // ${district}/
      tooltipDiv.html(`${DISTRICT}, ${ST_NM} <br/> ${metric}: ${m}`)

      d3.select(this).attr('stroke', '#333').attr('stroke-width', 2).raise()
    })
    .on('mouseout', function () {
      tooltipDiv.transition().duration(200).style('opacity', 0)
      d3.select(this).attr('stroke-width', 0)
    })

  metricSelect
    .selectAll('option')
    .data(metricOptionList)
    .join('option')
    .attr('value', d => d)
    .text(d => d)

  metricSelect.on('change', function (e, d) {
    metric = this.value

    districts.attr('fill', d => {
      const code = d.properties.censuscode

      if (censusDataObj[code]) {
        return colorScales[metric](censusDataObj[code][metric])
      } else {
        return 'gray'
      }
    })
  })

  // svg
  //   .append('path')
  //   .attr('pointer-events', 'none')
  //   .attr('fill', 'none')
  //   .attr('stroke', '#aaa')
  //   .attr('stroke-width', 0.5)
  //   .attr('d', path(districtMesh))

  svg
    .append('path')
    .attr('pointer-events', 'none')
    .attr('fill', 'none')
    .attr('stroke', '#333')
    .attr('stroke-width', 1)
    .attr('d', path(stateMesh))
})
