const { parse, unparse } = require('papaparse')
const fs = require('fs')

const fileData = fs.readFileSync('./india-districts-census-2011.csv', {
  encoding: 'utf-8',
})

const parsedData = parse(fileData, { header: true })

// console.log(Object.keys(parsedData))
// console.log(parsedData.data.length)

const { data: dataByDistrict } = parsedData

const stateNameField = 'State name'
const numberColumns = [
  'Population',
  'Male',
  'Female',
  'Literate',
  'Male_Literate',
  'Female_Literate',
  'SC',
  'Male_SC',
  'Female_SC',
  'ST',
  'Male_ST',
  'Female_ST',
  'Workers',
  'Male_Workers',
  'Female_Workers',
  'Main_Workers',
  'Marginal_Workers',
  'Non_Workers',
  'Cultivator_Workers',
  'Agricultural_Workers',
  'Household_Workers',
  'Other_Workers',
  'Hindus',
  'Muslims',
  'Christians',
  'Sikhs',
  'Buddhists',
  'Jains',
  'Others_Religions',
  'Religion_Not_Stated',
  'LPG_or_PNG_Households',
  'Housholds_with_Electric_Lighting',
  'Households_with_Internet',
  'Households_with_Computer',
  'Rural_Households',
  'Urban_Households',
  'Households',
  'Below_Primary_Education',
  'Primary_Education',
  'Middle_Education',
  'Secondary_Education',
  'Higher_Education',
  'Graduate_Education',
  'Other_Education',
  'Literate_Education',
  'Illiterate_Education',
  'Total_Education',
  'Age_Group_0_29',
  'Age_Group_30_49',
  'Age_Group_50',
  'Age',
  'not',
  'stated',
  'Households_with_Bicycle',
  'Households_with_Car_Jeep_Van',
  'Households_with_Radio_Transistor',
  'Households_with_Scooter_Motorcycle_Moped',
  'Households_with_Telephone_Mobile_Phone_Landline_only',
  'Households_with_Telephone_Mobile_Phone_Mobile_only',
  'Households_with_TV_Computer_Laptop_Telephone_mobile_phone_and_Scooter_Car',
  'Households_with_Television',
  'Households_with_Telephone_Mobile_Phone',
  'Households_with_Telephone_Mobile_Phone_Both',
  'Condition_of_occupied_census_houses_Dilapidated_Households',
  'Households_with_separate_kitchen_Cooking_inside_house',
  'Having_bathing_facility_Total_Households',
  'Having_latrine_facility_within_the_premises_Total_Households',
  'Ownership_Owned_Households',
  'Ownership_Rented_Households',
  'Type_of_bathing_facility_Enclosure_without_roof_Households',
  'Type_of_fuel_used_for_cooking_Any_other_Households',
  'Type_of_latrine_facility_Pit_latrine_Households',
  'Type_of_latrine_facility_Other_latrine_Households',
  'Type_of_latrine_facility_Night_soil_disposed_into_open_drain_Households',
  'Type_of_latrine_facility_Flush_pour_flush_latrine_connected_to_other_system_Households',
  'Not_having_bathing_facility_within_the_premises_Total_Households',
  'Not_having_latrine_facility_within_the_premises_Alternative_source_Open_Households',
  'Main_source_of_drinking_water_Un_covered_well_Households',
  'Main_source_of_drinking_water_Handpump_Tubewell_Borewell_Households',
  'Main_source_of_drinking_water_Spring_Households',
  'Main_source_of_drinking_water_River_Canal_Households',
  'Main_source_of_drinking_water_Other_sources_Households',
  'Main_source_of_drinking_water_Other_sources_Spring_River_Canal_Tank_Pond_Lake_Other_sources__Households',
  'Location_of_drinking_water_source_Near_the_premises_Households',
  'Location_of_drinking_water_source_Within_the_premises_Households',
  'Main_source_of_drinking_water_Tank_Pond_Lake_Households',
  'Main_source_of_drinking_water_Tapwater_Households',
  'Main_source_of_drinking_water_Tubewell_Borehole_Households',
  'Household_size_1_person_Households',
  'Household_size_2_persons_Households',
  'Household_size_1_to_2_persons',
  'Household_size_3_persons_Households',
  'Household_size_3_to_5_persons_Households',
  'Household_size_4_persons_Households',
  'Household_size_5_persons_Households',
  'Household_size_6_8_persons_Households',
  'Household_size_9_persons_and_above_Households',
  'Location_of_drinking_water_source_Away_Households',
  'Married_couples_1_Households',
  'Married_couples_2_Households',
  'Married_couples_3_Households',
  'Married_couples_3_or_more_Households',
  'Married_couples_4_Households',
  'Married_couples_5__Households',
  'Married_couples_None_Households',
  'Power_Parity_Less_than_Rs_45000',
  'Power_Parity_Rs_45000_90000',
  'Power_Parity_Rs_90000_150000',
  'Power_Parity_Rs_45000_150000',
  'Power_Parity_Rs_150000_240000',
  'Power_Parity_Rs_240000_330000',
  'Power_Parity_Rs_150000_330000',
  'Power_Parity_Rs_330000_425000',
  'Power_Parity_Rs_425000_545000',
  'Power_Parity_Rs_330000_545000',
  'Power_Parity_Above_Rs_545000',
  'Total_Power_Parity',
]

const ratioByPopulationList = [
  'SC',
  'ST',
  'Workers',
  'Hindus',
  'Muslims',
  'Christians',
  'Sikhs',
  'Buddhists',
  'Jains',
  'Others_Religions',
  'Religion_Not_Stated',
]

dataByDistrict.forEach(d => {
  ratioByPopulationList.forEach(m => {
    d[m + '_percentage'] = d[m] / d['Population']
  })
})

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

// console.log(dataByState)
const dataByStateArr = []

Object.keys(dataByState).forEach(s => {
  dataByStateArr.push({ state: s, ...dataByState[s] })
})

const dataByDistrictArr = []

Object.keys(dataByDistrict).forEach(d => {
  dataByDistrictArr.push({ ...dataByDistrict[d] })
})

// console.log(dataByStateArr)

const unparsedDataByState = unparse(dataByStateArr)
const unparsedDataByDistrict = unparse(dataByDistrictArr)
// console.log(unparsedDataByState)

// fs.writeFileSync('india-states-census-2011.csv', unparsedDataByState)
fs.writeFileSync('india-districts-census-2011_pc.csv', unparsedDataByDistrict)
