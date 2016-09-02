'use strict';

var L = require('leaflet');
var mapConfig = require('./config/leaflet');
var panelControl = require('./controls/panel');
var locationsHandler = require('./utils/locations');

// Define leaflet map.
L.Icon.Default.imagePath = 'node_modules/leaflet/dist/images';

var map = L.map('map', {layers: [mapConfig.tileLayer]});
map.setView(mapConfig.initCenter, mapConfig.initZoom);

panelControl.addTo(map);

map.on('click', function(e){
  locationsHandler.addPlace(map, e.latlng);
});

module.exports = {
  map: map
};
