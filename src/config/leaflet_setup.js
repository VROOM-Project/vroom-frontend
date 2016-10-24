'use strict';

var L = require('leaflet');
var api = require('./api');

L.Icon.Default.imagePath = 'css/images/';

var initCenter = L.latLng(48.8579,2.3494);
var initZoom = 13;

var attribution = '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors';
if(api.description){
  attribution = 'Demo solver hosted by '
    + api.description
    + ' | ' + attribution;
}

var tileLayer = L.tileLayer(api.tileLayer, {attribution: attribution});

// Define a valid bounding box here in order to restrict map view and
// place definition.
var maxBounds = undefined;

var map = L.map('map', {layers: [tileLayer]}).setView(initCenter, initZoom);

module.exports = {
  map: map,
  maxBounds: maxBounds,
  initCenter: initCenter,
  initZoom: initZoom,
  tileLayer: tileLayer,
  opacity: 0.6,
  weight: 8,
  snakingSpeed: 800,
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
