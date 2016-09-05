'use strict';

var data = require('../data');
var mapConfig = require('../config/leaflet');

var getJobsSize = function(){
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
  removeStart(map);
  removeEnd(map);

  // Init dataset.
  data.jobs = [];
  data.jobsMarkers = [];
  data.vehicles = [{'id': 0}];
}

var updateJobDescription = function(jobIndex,
                                    description,
                                    remove,
                                    setAsStart,
                                    setAsEnd){
  data.jobs[jobIndex]['description'] = description;

  // Marker popup.
  var popupDiv = document.createElement('div');
  var par = document.createElement('p');
  par.innerHTML = description;
  var deleteButton = document.createElement('button');
  deleteButton.innerHTML = 'Delete';
  deleteButton.onclick = remove;
  var asStartButton = document.createElement('button');
  asStartButton.innerHTML = 'Set as start';
  asStartButton.onclick = setAsStart;
  var asEndButton = document.createElement('button');
  asEndButton.innerHTML = 'Set as end';
  asEndButton.onclick = setAsEnd;
  popupDiv.appendChild(par);
  popupDiv.appendChild(asStartButton);
  popupDiv.appendChild(asEndButton);
  popupDiv.appendChild(deleteButton);

  data.jobsMarkers[jobIndex].bindPopup(popupDiv).openPopup();
}

var updateStartDescription = function(description, remove){
  data.vehicles[0].startDescription = description;

  // Marker popup.
  var popupDiv = document.createElement('div');
  var par = document.createElement('p');
  par.innerHTML = description;
  var deleteButton = document.createElement('button');
  deleteButton.innerHTML = 'Delete start';
  deleteButton.onclick = remove;
  popupDiv.appendChild(par);
  popupDiv.appendChild(deleteButton);

  data.startMarker.bindPopup(popupDiv).openPopup();
}

var updateEndDescription = function(description, remove){
  data.vehicles[0].endDescription = description;

  // Marker popup.
  var popupDiv = document.createElement('div');
  var par = document.createElement('p');
  par.innerHTML = description;
  var deleteButton = document.createElement('button');
  deleteButton.innerHTML = 'Delete end';
  deleteButton.onclick = remove;
  popupDiv.appendChild(par);
  popupDiv.appendChild(deleteButton);

  data.endMarker.bindPopup(popupDiv).openPopup();
}

var addStart = function(map, latlng){
  if(data.startMarker){
    map.removeLayer(data.startMarker);
  }
  data.vehicles[0].start = [latlng.lng,latlng.lat];
  data.startMarker = L.marker(latlng).addTo(map).setIcon(mapConfig.startIcon);
}

var addEnd = function(map, latlng){
  if(data.endMarker){
    map.removeLayer(data.endMarker);
  }
  data.vehicles[0].end = [latlng.lng,latlng.lat];
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
  if(data.startMarker){
    map.removeLayer(data.startMarker);
    delete data.vehicles[0].startDescription;
    delete data.vehicles[0].start;
    data.startMarker = undefined;
  }
}

var removeEnd = function(map){
  if(data.endMarker){
    map.removeLayer(data.endMarker);
    delete data.vehicles[0].endDescription;
    delete data.vehicles[0].end;
    data.endMarker = undefined;
  }
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
  getJobsSize: getJobsSize,
  getStart: getStart,
  getEnd: getEnd,
  clearData: clearData,
  addStart: addStart,
  addEnd: addEnd,
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
