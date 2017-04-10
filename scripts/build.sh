#!/bin/sh

cp node_modules/leaflet/dist/leaflet.css css/leaflet.css
cp -r node_modules/leaflet/dist/images css/
cp -r node_modules/leaflet-control-geocoder/dist/images css/
cp node_modules/leaflet-control-geocoder/dist/Control.Geocoder.css css/Control.Geocoder.css
browserify -d src/map.js > bundle.raw.js && uglifyjs bundle.raw.js -c -m -o bundle.js
