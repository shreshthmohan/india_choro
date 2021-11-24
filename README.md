India Choropleth

1. Download shape files (and associated project files) from https://github.com/datameet/maps/tree/master/Districts/Census_2011
2. Download 2011 Census Data from https://github.com/nishusharma1608/India-Census-2011-Analysis/blob/master/india-districts-census-2011.csv
3. Upload all files to mapshaper.org
4. Export as topojson (topojson file is smaller than geojson file. Because, topojson is optimized by sharing adjacent arcs.)
5. Add state shapes in topojson by merging districts with same state name. (see package.json -> scripts -> mergeDistricts) This use the topomerge utility from topojson-client package.
6. Calculate percentage numbers for different metrics and generate new CSV file (processData.js)
7. Fetch CSV census data and topojson file (Promise.all)
8. D3 understands GeoJSON, so we have to convert TopoJSON to GeoJSON using [topojson](https://github.com/topojson/topojson)










2011 Census Data in CSV format
https://github.com/nishusharma1608/India-Census-2011-Analysis/blob/master/india-districts-census-2011.csv

2011 Census Shape files
https://github.com/datameet/maps/tree/master/Districts/Census_2011

https://mapshaper.org/

    “D3 uses GeoJSON to represent geographic features in JavaScript.”  (https://github.com/d3/d3-geo#d3-geo)

