'use strict';

require('leaflet-control-geocoder');

var nominatim = L.Control.Geocoder.nominatim();

var control = L.Control.geocoder({
  geocoder: nominatim,
  collapsed: false,
  position: 'topleft'
});

module.exports = {
  nominatim: nominatim,
  control: control
};
