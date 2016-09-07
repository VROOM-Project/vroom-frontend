'use strict';

var L = require('leaflet');
var mapConfig = require('./config/leaflet');
var panelControl = require('./controls/panel');
var locationsHandler = require('./utils/locations');
var geocoder = require('./utils/geocoder');
var address = require('./utils/address');

// Define leaflet map.
L.Icon.Default.imagePath = 'node_modules/leaflet/dist/images';

var map = L.map('map', {layers: [mapConfig.tileLayer]});
map.setView(mapConfig.initCenter, mapConfig.initZoom);

panelControl.addTo(map);

map.on('click', function(e){
  locationsHandler.addPlace(map, e.latlng);
});

geocoder.control.markGeocode = function(result) {
  locationsHandler.addPlace(map,
                            result.geocode.center,
                            address.display(result.geocode));
};

// TODO: switch on when
// https://github.com/perliedman/leaflet-control-geocoder/issues/142
// is solved

// geocoder.control.addTo(map);

module.exports = {
  map: map
};
