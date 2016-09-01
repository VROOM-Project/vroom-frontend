'use strict';

var L = require('leaflet');
var mapConfig = require('./config/leaflet');

// Define leaflet map.
var map = L.map('map', {layers: [mapConfig.tileLayer]});
map.setView(mapConfig.initCenter, mapConfig.initZoom);

module.exports = {
  map: map
};
