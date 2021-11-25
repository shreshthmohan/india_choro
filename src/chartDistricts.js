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

const loadingIndicator = d3
  .select('#chart-container')
  .append('div')
  .html('Loading data...')

const overlay = d3.select('#overlay-content-box')
const overlayWrapper = d3.select('#overlay-wrapper')

d3.select('#close-overlay').on('click', function () {
  overlay.style('display', 'none')
  overlayWrapper.style('display', 'none')
})

d3.select(document)
  .on('click', e => {
    console.log(e.target.id)
    if (e.target.id === 'overlay-wrapper') {
      overlay.style('display', 'none')
      overlayWrapper.style('display', 'none')
    }
  })
  .on('keydown', e => {
    if (e.which === 27) {
      overlay.style('display', 'none')
      overlayWrapper.style('display', 'none')
    }
  })

Promise.all([d3.csv(dataPath), d3.json(districtsTopoJSON)])
  .then(([censusData, districtsShapeData]) => {
    loadingIndicator.remove()

    // districtsShapeData is in topoJSON format
    // Convert topoJSON to geoJSON (d3 needs geoJSON)
    const districtsShapeGeo = topojson.feature(
      districtsShapeData,
      districtsShapeData.objects['2011_Dist'],
    )
    // districtsShapeGeo is in geoJSON format

    // Keys will be district codes
    censusData.forEach(dst => {
      censusDataObj[dst[district_code_field]] = dst
    })

    const chartContainer = d3.select('#chart-container')
    chartContainer.style('position', 'relative')
    const tooltipDiv = chartContainer
      .append('div')
      .attr(
        'style',
        'position: absolute; font-size: 15px; top: 120px; right: 40px; padding: 8px 10px; border: 1px solid #777; border-radius: 4px; background: white; text-transform: capitalize',
      )
      .html('Hover on a district to see its data')

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

    const showDetailsButton = widgetsLeft
      .append('button')
      .text('Show Details')
      .on('click', () => {
        overlay.style('display', 'block')
        overlayWrapper.style('display', 'block')
      })

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

    //
    const formats = {
      'sex ratio': '.5r', // round off to 5 significant digits
      'literacy rate': '.3p', // percentage, 3 significat digits (value is between 0 and 1, where 1 means 100%)
      'Population': '', // no format
      'SC_percentage': '.3p',
      'ST_percentage': '.3p',
      'Hindus_percentage': '.3p',
      'Muslims_percentage': '.3p',
      'Christians_percentage': '.3p',
      'Sikhs_percentage': '.3p',
      'Buddhists_percentage': '.3p',
      'Jains_percentage': '.3p',
      'Others_Religions_percentage': '.3p',
      'Religion_Not_Stated_percentage': '.3p',
      'Workers_percentage': '.3p',
    }

    const metricValues = {}

    metricOptionList.forEach(m => {
      metricValues[m] = []
    })

    // Convert string data to float
    censusData.forEach(d => {
      metricOptionList.forEach(m => {
        d[m] = parseFloat(d[m])
        metricValues[m].push(parseFloat(d[m]))
      })
    })

    // Special case, calculate color scale such that
    // central color (white) corresponds to balanced sex ratio of 1000
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

      // d3.extent calculate minimum and maximum values of that metric
      // reverse: if purple is high which means it's good
      // slice: is to copy the array without changing the original array
      'literacy rate': d3
        .scaleSequential(d3.interpolatePuOr)
        .domain(d3.extent(metricValues['literacy rate']).slice().reverse()),

      'Population': d3
        .scaleSequential(d3.interpolateSpectral)
        .domain(d3.extent(metricValues['Population']).slice().reverse()),

      'SC_percentage': d3
        .scaleSequential(d3.interpolateRdYlBu)
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
        .scaleSequential(d3.interpolateMagma)
        .domain(
          d3.extent(metricValues['Christians_percentage']).slice().reverse(),
        ),

      'Sikhs_percentage': d3
        .scaleSequential(d3.interpolateGreys)
        .domain(d3.extent(metricValues['Sikhs_percentage'])),

      'Buddhists_percentage': d3
        .scaleSequential(d3.interpolateBrBG)
        .domain(
          d3.extent(metricValues['Buddhists_percentage']).slice().reverse(),
        ),
      'Jains_percentage': d3
        .scaleSequential(d3.interpolatePurples)
        .domain(d3.extent(metricValues['Jains_percentage'])),

      'Others_Religions_percentage': d3
        .scaleSequential(d3.interpolateGreys)
        .domain(d3.extent(metricValues['Others_Religions_percentage'])),

      'Religion_Not_Stated_percentage': d3
        .scaleSequential(d3.interpolateReds)
        .domain(d3.extent(metricValues['Religion_Not_Stated_percentage'])),

      'Workers_percentage': d3
        .scaleSequential(d3.interpolateBuGn)
        .domain(d3.extent(metricValues['Workers_percentage'])),
    }

    // overlay descriptions for each metric
    const descriptions = {
      'sex ratio':
        'Number of females per 1000 female. White represents 1000, i.e. a balanced sex ratio.As per the latest Census in the year 2011, the total female sex ratio in India is 940 per 1000 males and the female child sex ratio is 944 girl children per every 1000 boy children of the same age group. The overall female sex ratio has increased by 0.75 % in the Census 2011 as compared to the previous Census of 2001.',
      'Population':
        'As per the Provisional Population Totals of Census 2011, the total population of India was 1210.2 million. Of this, the rural population stands at 833.1 million and the urban population 377.1 million. ... The growth rate of population in rural and urban areas was 12.18% and 31.80% respectively.',
      'literacy rate':
        'As per Census 2011, the literacy rate at all India level is 72.98% and the literacy rate for females and males are 64.63% and 80.9% respectively. During the last decade, the highest improvement in literacy rate was observed among rural females (24%).',

      'SC_percentage':
        'As per Census- 2011, the number of scheduled castes in India is 20, 13, and 78,086. It is 16.6% of the total population of India. The scheduled castes are 18.5% of the total population of rural areas and 12.6% of urban areas. It is to be noted that during 2001-2011 the decadal growth rate of the population of India was 17.64%. During this period decadal growth rate of the scheduled castes was 20.8%.',
      'ST_percentage':
        'This report highlights the data and demographics of scheduled tribes (ST) in 30 states and union territories of India, as documented in Census 2011. The report makes comparisons from 1961 by showing population trends as well as decadal growth rate. It also focuses on the livelihoods of people from scheduled castes and tribes (SC/ST) in rural as well as urban India.',
      'Hindus_percentage':
        'Hinduism is professed by the majority of population in India. The Hindus are most numerous in 27 states/Uts except in Manipur, Arunachal Pradesh, Mizoram, Lakshadweep, Nagaland, Meghalaya, Jammu & Kashmir and Punjab.',
      'Muslims_percentage':
        'The Muslims professing Islam are in majority in Lakshadweep and Jammu & Kashmir. The percentage of Muslims is sizeable in Assam (30.9%), West Bengal (25.2%), Kerala (24.7%), Uttar Pradesh (18.5%) and Bihar (16.5%).',
      'Christians_percentage':
        ' Christianity has emerged as the major religion in three North-eastern states, namely, Nagaland, Mizoram, and Meghalaya. Among other states/Uts, Manipur (34.0%), Goa (26.7%), Andaman & Nicobar Islands (21.7%), Kerala (19.0%), and Arunachal Pradesh (18.7%) have considerable percentage of Christian population to the total population of the State/UT.',
      'Sikhs_percentage':
        'Punjab is the stronghold of Sikhism. The Sikh population of Punjab accounts for more than 75 % of the total Sikh population in the country. Chandigarh (16.1%), Haryana (5.5%), Delhi (4.0%), Uttaranchal (2.5%) and Jammu & Kashmir (2.0%) are other important States/Uts having Sikh population. These six states/Uts together account for nearly 90 percent Sikh population in the country.',
      'Buddhists_percentage':
        'The largest concentration of Buddhism is in Maharashtra (58.3%), where (73.4%) of the total Buddhists in India reside. Karnataka (3.9 lakh), Uttar Pradesh (3.0 lakh), west Bengal (2.4 lakh) and Madhya Pradesh (2.0 lakh) are other states having large Buddhist population. Sikkim (28.1%), Arunachal Pradesh (13.0%) and Mizoram (7.9 %) have emerged as top three states in terms of having maximum percentage of Buddhist population.',
      'Jains_percentage':
        'Maharashtra, Rajsthan, Madhya Pradesh, Gujrat, Karnataka, Uttar Pradesh and Delhi have reported major Jain population. These states/Uts together account for nearly 90 percent of the total Jain population in the country. The percentage of Jain population to the total population is maximum in Maharastra (1.3%), Rajsthan (1.2%), Delhi (1.1%) and Gujrat (1.0%). Elsewhere in the country their proportion in negligible.',
      'Others_Religions_percentage':
        'other religions are 0.8 per cent, 0.4 per cent and 0.6 per cent respectively.',
      'Religion_Not_Stated_percentage':
        "Around 29 lakh people in India fall into the “religion not stated” category in the Census 2011 results. This comes to only about 0.24% of India's population, but it does represent a significant jump from a decade back",
      'Workers_percentage':
        'As per NSS 2011-12, the Worker Population Ratio for females is higher in rural areas (24.8%) than urban areas (14.7%). For males, the ratios in rural and urban areas are 54.3% and 54.6 respectively. Thus, considerable gender gap exists in both rural and urban areas and the gap is  higher in urban areas.',
    }

    // default value selected is first element in the metricOptionsList array (sex ratio)
    let metric = metricOptionList[0]

    const metricSelect = widgetsLeft
      .append('select')
      // .attr('style', 'font-size: 20px')
      .lower()

    // const districtMesh = topojson.mesh(
    //   districtsShapeData,
    //   districtsShapeData.objects['2011_Dist'],
    //   // internal boundaries
    //   // (a, b) => a !== b,
    //   // external boundaries
    //   // (a, b) => a == b,
    // )

    // create a mesh using topojson to mark state boundaries
    const stateMesh = topojson.mesh(
      districtsShapeData,
      districtsShapeData.objects.states,
      // internal boundaries
      // (a, b) => a !== b,
      // external boundaries
      // (a, b) => a !== b,
      // all boundaries will be show if you don't provide a filter function
    )

    const onlyOneStateGeo = {
      type: districtsShapeGeo.type,
      features: districtsShapeGeo.features.filter(
        // f => f.properties.ST_NM === 'Andhra Pradesh',
        f => f.properties.ST_NM === 'Chhattisgarh',
      ),
    }

    const path = d3
      .geoPath()
      // use fitSize to scale, transform shapes to take up the whole available space inside svg
      .projection(
        d3
          // projection: mercator
          .geoMercator()
          .fitSize([viewBoxWidth, viewBoxHeight], onlyOneStateGeo),
        // .fitSize([viewBoxWidth, viewBoxHeight], districtsShapeGeo),
      )

    console.log('length:', Object.keys(districtsShapeGeo))
    console.log('type:', districtsShapeGeo.type)
    console.log('feature:', districtsShapeGeo.features[0])

    const districts = svg
      .append('g')
      .selectAll('path')
      .data(onlyOneStateGeo.features)
      .join('path')
      .attr('d', path)
      // fill color inside district shape
      .attr('fill', d => {
        const code = d.properties.censuscode

        if (censusDataObj[code]) {
          return colorScales[metric](censusDataObj[code][metric])
        } else {
          return 'gray'
        }
      })
      .on('mouseover', function (e, d) {
        const { DISTRICT, censuscode, ST_NM } = d.properties

        tooltipDiv.transition().duration(200).style('opacity', 1)
        if (censusDataObj[censuscode]) {
          const { [metric]: m, 'District name': district } =
            censusDataObj[censuscode]
          // ${district}/
          tooltipDiv.html(
            `${DISTRICT}, ${ST_NM} <br/> ${metric}: ${d3.format(
              formats[metric],
            )(m)}`,
          )
        } else {
          tooltipDiv.html(`${DISTRICT} <br/> No data available.`)
        }

        // Outline
        // Raise so that outline is not hidden behind neighbouring shapes
        d3.select(this).attr('stroke', '#333').attr('stroke-width', 2).raise()
      })
      .on('mouseout', function () {
        // hide tooltip
        tooltipDiv.transition().duration(200).style('opacity', 0)

        // remove outline
        d3.select(this).attr('stroke-width', 0)
      })

    // add <option>s to the <select> tag based on items in metricOptionList array
    metricSelect
      .selectAll('option')
      .data(metricOptionList)
      .join('option')
      .attr('value', d => d)
      .text(d => d)

    // add description to overlay <p> based on selected metric
    overlay.select('p').html(descriptions[metric])

    // overlay is initially hidden
    // show overlay and overlay wrapper
    overlay.style('display', 'block')
    overlayWrapper.style('display', 'block')

    // when you select a different <option>
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

      // show description for metric only if it exists in descriptions object
      if (descriptions[metric]) {
        overlay.select('p').html(descriptions[metric])

        overlay.style('display', 'block')
        overlayWrapper.style('display', 'block')
      }
    })

    svg
      .append('path')
      .attr('pointer-events', 'none')
      .attr('fill', 'none')
      .attr('stroke', '#333')
      .attr('stroke-width', 1)
      .attr('d', path(stateMesh))
  })
  .catch(err => {
    loadingIndicator.html(`${err}`)
  })
