'use strict';

var data = require('../data');
var mapConfig = require('../config/leaflet');

var getSize = function(){
  return data.jobs.length;
}

var getStart = function(){
  return data.vehicles[0].start;
}

var getEnd = function(){
  return data.vehicles[0].end;
}

var clearData = function(map){
  // Clear all data and markers.
  for(var i = 0; i < data.jobsMarkers.length; i++){
    map.removeLayer(data.jobsMarkers[i]);
  }

  // Init dataset.
  data.jobs = [];
  data.jobsMarkers = [];
  data.vehicles = [{'id': 0}];
}

var updateJobDescription = function(jobIndex, description, removeCallback){
  data.jobs[jobIndex]['description'] = description;
  var popupDiv = document.createElement('div');
  var par = document.createElement('p');
  par.innerHTML = description;
  var btn = document.createElement('button');
  btn.innerHTML = 'Delete';
  btn.onclick = removeCallback;
  popupDiv.appendChild(par);
  popupDiv.appendChild(btn);
  data.jobsMarkers[jobIndex].bindPopup(popupDiv).openPopup();
}

var updateStartDescription = function(description){
  data.vehicles[0].startDescription = description;
  data.startMarker.bindPopup(description).openPopup();
}

var updateEndDescription = function(description){
  data.vehicles[0].endDescription = description;
  data.endMarker.bindPopup(description).openPopup();
}

var addFirst = function(map, latlng){
  data.vehicles[0].start = [latlng.lng,latlng.lat];
  data.vehicles[0].end = [latlng.lng,latlng.lat];
  data.startMarker = L.marker(latlng).addTo(map).setIcon(mapConfig.startIcon);
  data.endMarker = L.marker(latlng).addTo(map).setIcon(mapConfig.endIcon);
}

var addJob = function(map, latlng){
  data.jobs.push({'location': [latlng.lng,latlng.lat]});
  data.jobsMarkers.push(L.marker(latlng)
                        .addTo(map)
                        .setIcon(mapConfig.jobIcon));
}

var removeJob = function(map, jobIndex){
  map.removeLayer(data.jobsMarkers[jobIndex]);
  data.jobs.splice(jobIndex, 1);
  data.jobsMarkers.splice(jobIndex, 1);
}

var removeStart = function(map){
  map.removeLayer(data.startMarker);
  delete data.vehicles[0].startDescription;
  delete data.vehicles[0].start;
  data.startMarker = undefined;
}

var removeEnd = function(map){
  map.removeLayer(data.endMarker);
  delete data.vehicles[0].endDescription;
  delete data.vehicles[0].end;
  data.endMarker = undefined;
}

var showMarker = function(map, markerIndex, center){
  data.jobsMarkers[markerIndex].openPopup();
  if(center){
    map.panTo(data.jobsMarkers[markerIndex].getLatLng());
  }
}

var showStart = function(map, center){
  data.startMarker.openPopup();
  if(center){
    map.panTo(data.startMarker.getLatLng());
  }
}

var showEnd = function(map, center){
  data.endMarker.openPopup();
  if(center){
    map.panTo(data.endMarker.getLatLng());
  }
}

module.exports = {
  getSize: getSize,
  getStart: getStart,
  getEnd: getEnd,
  clearData: clearData,
  addFirst: addFirst,
  addJob: addJob,
  updateJobDescription: updateJobDescription,
  updateStartDescription: updateStartDescription,
  updateEndDescription: updateEndDescription,
  removeJob: removeJob,
  removeStart: removeStart,
  removeEnd: removeEnd,
  showMarker: showMarker,
  showStart: showStart,
  showEnd: showEnd
};
