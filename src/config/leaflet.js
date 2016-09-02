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
  tileLayer: tileLayer,
  jobIcon: L.icon({
    iconUrl: 'images/job-icon.png',
    iconSize: [15, 15],
    iconAnchor: [7.5, 7.5],
    popupAnchor: [0, 0]
  })
};
