'use strict';

var L = require('leaflet');
var mapConfig = require('./config/leaflet');
var panelControl = require('./controls/panel');

// Define leaflet map.
var map = L.map('map', {layers: [mapConfig.tileLayer]});
map.setView(mapConfig.initCenter, mapConfig.initZoom);

panelControl.addTo(map);
module.exports = {
  map: map
};
