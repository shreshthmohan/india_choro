const census2011Reduced =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSxyga50qbpNOzeccy52LyF696f6Nj66PAI7WWFLuzxI2QMmdF8Hvk5CfFjOTR0tsZOxKEhWfW7TXBR/pub?gid=7310244&single=true&output=csv'

const topoJSON = './2011_india_states.topo.json'

const dataPath = census2011Reduced
const shapeJSONPath = topoJSON

const district_code_field = 'District code'
const district_name_field = 'District name'

// 1. get topojson
// 2. convert to geojson

Promise.all([d3.csv(dataPath), d3.json(shapeJSONPath)]).then(
  ([censusData, shapeData]) => {
    // 1. shapeData is in topoJSON format

    // 2. Convert topoJSON to geoJSON (d3 needs geoJSON)
    const shapeGeo = topojson.feature(shapeData, shapeData.objects.states)

    // Keys will be district codes
    // const censusDataObj = {}
    // censusData.forEach(dst => {
    //   censusDataObj[dst[district_code_field]] = dst
    // })

    const svg = d3.select('#chart-container').append('svg')
    svg.attr('width', 900).attr('height', 700)

    const colorDomain = censusData.map(d => parseFloat(d.sex_ratio)).sort()
    const colorScale = d3
      .scaleQuantile()
      .domain(colorDomain)
      .range(d3.schemeRdBu[5])

    const stateMesh = topojson.mesh(
      shapeData,
      shapeData.objects.states,
      // internal boundaries
      (a, b) => a !== b,
      // external boundaries
      // (a, b) => a == b,
    )

    const path = d3
      .geoPath()
      .projection(d3.geoMercator().fitSize([900, 700], shapeGeo))

    svg.append('g').selectAll('path').data(shapeGeo.features).join('path').attr(
      'd',
      // use fitSize to scale, transform shapes to take up the whole available space inside svg
      path,
    )
    // .attr('fill', d => {
    //   const code = d.properties.DT_CEN_CD
    //   const val = censusDataObj[code].sex_ratio
    //   return colorScale(val)
    // })
    // .on('mouseover', (e, d) => {
    //   const { DISTRICT, DT_CEN_CD, ST_NM } = d.properties

    //   const sexRatio = censusDataObj[DT_CEN_CD].sex_ratio

    //   // console.log(`${DISTRICT}, ${ST_NM}: ${sexRatio}`)
    // })

    svg
      .append('path')
      .attr('pointer-events', 'none')
      .attr('fill', 'none')
      .attr('stroke', 'white')
      // .attr("stroke-linecap", strokeLinecap)
      // .attr("stroke-linejoin", strokeLinejoin)
      // .attr("stroke-width", strokeWidth)
      // .attr("stroke-opacity", strokeOpacity)
      .attr('d', path(stateMesh))
    // .attr('stroke', '#333')
    // .attr('stroke-width', d => {
    //   const { DISTRICT, DT_CEN_CD, ST_NM } = d.properties
    //   const {
    //     [district_code_field]: district_code_from_data,
    //     [district_name_field]: district_name_from_data,
    //   } = censusDataObj[DT_CEN_CD]
    //   // console.log(
    //   //   `Shape: ${DISTRICT} ${ST_NM} (${DT_CEN_CD}) - Data: ${district_code_from_data}`,
    //   // )
    //   if (parseInt(DT_CEN_CD, 10) !== parseInt(district_code_from_data, 10)) {
    //     console.log(
    //       `Shape: ${DISTRICT} ${ST_NM} (${DT_CEN_CD}) - Data: (${district_code_from_data}) ${district_name_from_data}`,
    //     )
    //   }
    // })
  },
)