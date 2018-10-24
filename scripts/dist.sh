#!/usr/bin/env bash

npm run build
rm bundle.raw.js

rm -rf dist
mkdir dist

mv -v bundle.js dist
cp -rv css dist
cp -rv images dist
cp -v index.html dist

sed -i 's/src\/map.js/bundle.js/' dist/index.html

cp -v ./node_modules/leaflet/dist/leaflet.css dist/css/leaflet.css

cp -v ./node_modules/leaflet-control-geocoder/dist/Control.Geocoder.css dist/css/Control.Geocoder.css
cp -rv ./node_modules/leaflet-control-geocoder/dist/images dist/css/

sed -i 's/node_modules\/leaflet\/dist/css/' dist/index.html
sed -i 's/node_modules\/leaflet-control-geocoder\/dist/css/' dist/index.html

sed -i 's/\.\.\/\.\.\/images\/vroom/\.\/images\/vroom/' dist/bundle.js

