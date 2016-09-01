'use strict';

var api = require('./api');
var L = require('leaflet');

var initCenter = L.latLng(48.8579,2.3494);
var initZoom = 13;

var tileLayer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png',{
  attribution: 'Demo solver hosted by '
    + api.description
    + ' | &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
});

module.exports = {
  initCenter: initCenter,
  initZoom: initZoom,
  tileLayer: tileLayer
};
