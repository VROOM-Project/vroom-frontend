'use strict';

var api = require('./api');
var L = require('leaflet');

var initCenter = L.latLng(48.8579,2.3494);
var initZoom = 13;

var tileLayer = L.tileLayer(api.tileLayer, {
  attribution: 'Demo solver hosted by '
    + api.description
    + ' | &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
});

module.exports = {
  initCenter: initCenter,
  initZoom: initZoom,
  tileLayer: tileLayer,
  opacity: 0.6,
  weight: 8,
  snakingSpeed: 400,
  jobIcon: L.icon({
    iconUrl: 'images/job-icon.png',
    iconSize: [15, 15],
    iconAnchor: [7.5, 7.5],
    popupAnchor: [0, 0]
  }),
  startIcon: L.icon({
    iconUrl: 'images/start-icon.png',
    iconSize: [15, 15],
    iconAnchor: [7.5, 7.5],
    popupAnchor: [0, 0]
  }),
  endIcon: L.icon({
    iconUrl: 'images/end-icon.png',
    iconSize: [15, 15],
    iconAnchor: [7.5, 7.5],
    popupAnchor: [0, 0]
  })
};
