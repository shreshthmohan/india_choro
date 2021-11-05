India Choropleth

2011 Census Data in CSV format
https://github.com/nishusharma1608/India-Census-2011-Analysis/blob/master/india-districts-census-2011.csv

2011 Census Shape files
https://github.com/datameet/maps/tree/master/Districts/Census_2011

https://mapshaper.org/

    “D3 uses GeoJSON to represent geographic features in JavaScript.”  (https://github.com/d3/d3-geo#d3-geo)

Import all project files into map shaper, with following options

1. Detect line intersection (on)
2. Snap vertices (on)

Export as geoJSON: (mapshaper seems to be returning geoJSON with a bounding rectange that prevents map from taking up full space)

So currently using topoJSON (which doesn't have the extra bounding rectangle)

(TopoJSON vs GeoJSON)
Compare performance of the following:

1. Shapes described by GeoJSON, then rendered using d3
2. Shapes described by TopoJSON, converted to geojson and then rendered by d3
