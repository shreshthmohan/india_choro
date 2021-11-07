const { parse } = require('papaparse')
const fs = require('fs')

const fileData = fs.readFileSync('./india-districts-census-2011.csv', {
  encoding: 'utf-8',
})

const parsedData = parse(fileData, { header: true })

// console.log(Object.keys(parsedData))
// console.log(parsedData.data.length)

const { data: dataByDistrict } = parsedData

const stateNameField = 'State name'
const numberColumns = ['Population', 'Male', 'Female']

const dataByState = {}
dataByDistrict.forEach(d => {
  const state = d[stateNameField]
  if (!dataByState[state]) {
    dataByState[state] = {}
    numberColumns.forEach(c => {
      dataByState[state][c] = parseFloat(d[c])
    })
  } else {
    numberColumns.forEach(c => {
      dataByState[state][c] = parseFloat(d[c])
    })
  }
})

console.log(dataByState)
