'use strict';

var L = require('leaflet');
var api = require('./api');

L.Icon.Default.imagePath = 'css/images/';

var initCenter = L.latLng(48.8579,2.3494);
var initZoom = 13;

var attribution = 'Routes computed using <a href="http://project-osrm.org/">OSRM</a>'
    + ' | '
    + '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors';
if (api.description) {
  attribution = 'Demo solver hosted by '
    + api.description
    + ' | ' + attribution;
}

var tileLayer = L.tileLayer(api.tileLayer, {attribution: attribution});

// Define a valid bounding box here in order to restrict map view and
// place definition.
var maxBounds = undefined;

// Optional minZoom value.
var minZoom = undefined;

var map = L.map('map', {layers: [tileLayer]})
    .setView(initCenter, initZoom)
    .setMaxBounds(maxBounds)
    .setMinZoom(minZoom);

// Palette partly borrowed from https://clrs.cc/
var routeColors = [
  '#0074D9',   // blue
  '#FF851B',   // orange
  '#B10DC9',   // purple
  '#2ECC40',   // green
  '#FFDC00',   // yellow
  '#F012BE',   // fuchsia
  '#01FF70',   // lime
  '#999999'    // gray
  '#001f3f',   // navy
  '#FF4136',   // red
  '#85144b',   // maroon
  '#3D9970',   // olive
  '#39CCCC',   // teal
];

module.exports = {
  map: map,
  maxBounds: maxBounds,
  initCenter: initCenter,
  initZoom: initZoom,
  tileLayer: tileLayer,
  opacity: 0.6,
  labelOpacity: 0.9,
  weight: 8,
  routeColors: routeColors,
  startColor: '#48b605',
  endColor: '#e9130a',
  jobColor: '#3388ff',
  jobRadius: 6,
  unassignedColor: '#111111',
  unassignedRadius: 8
};
