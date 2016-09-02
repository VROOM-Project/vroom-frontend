'use strict';

var L = require('leaflet');
var mapConfig = require('./config/leaflet');
var panelControl = require('./controls/panel');
var data = require('./data');

// Define leaflet map.
L.Icon.Default.imagePath = 'node_modules/leaflet/dist/images';

var map = L.map('map', {layers: [mapConfig.tileLayer]});
map.setView(mapConfig.initCenter, mapConfig.initZoom);

panelControl.addTo(map);

// Add locations.
var addPlace = function(latlng){
  data.jobs.push({'location': [latlng.lng,latlng.lat]});
  data.jobsMarkers.push(L.marker(latlng)
                        .addTo(map)
                        .setIcon(mapConfig.jobIcon));
}

map.on('click', function(e){
  addPlace(e.latlng);
});

module.exports = {
  map: map
};
