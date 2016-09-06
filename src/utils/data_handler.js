'use strict';

var L = require('leaflet');
var polyUtil = require('polyline-encoded');
var data = require('../data');
var mapConfig = require('../config/leaflet');
var panelControl = require('../controls/panel');

var routes = [];

var getJobs = function(){
  return data.jobs;
}

var getVehicles = function(){
  return data.vehicles;
}

var getJobsSize = function(){
  return data.jobs.length;
}

var getStart = function(){
  return data.vehicles[0].start;
}

var getEnd = function(){
  return data.vehicles[0].end;
}

var resetStart = function(map){
  if(data.startMarker){
    map.removeLayer(data.startMarker);
    delete data.vehicles[0].startDescription;
    delete data.vehicles[0].start;
    data.startMarker = undefined;
  }
}

var resetEnd = function(map){
  if(data.endMarker){
    map.removeLayer(data.endMarker);
    delete data.vehicles[0].endDescription;
    delete data.vehicles[0].end;
    data.endMarker = undefined;
  }
}

var clearSolution = function(map){
  // Only one route so far to remove.
  if(routes.length > 0){
    map.removeLayer(routes[0]);
    routes = [];
    // Remove all numbered tooltips.
    for(var i = 0; i < data.jobsMarkers.length; i++){
      map.removeLayer(data.jobsMarkers[i].getTooltip());
    }
  }
}

var clearData = function(map){
  // Clear all data and markers.
  for(var i = 0; i < data.jobsMarkers.length; i++){
    map.removeLayer(data.jobsMarkers[i]);
  }
  resetStart(map);
  resetEnd(map);

  // Init dataset.
  data.jobs = [];
  data.jobsMarkers = [];
  data.vehicles = [{'id': 0}];

  clearSolution(map);
}

var closeAllPopups = function(){
  for(var i = 0; i < data.jobsMarkers.length; i++){
    data.jobsMarkers[i].closePopup();
  }
  if(data.startMarker){
    data.startMarker.closePopup();
  }
  if(data.endMarker){
    data.endMarker.closePopup();
  }
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
  clearSolution(map);
  if(data.startMarker){
    map.removeLayer(data.startMarker);
  }
  data.vehicles[0].start = [latlng.lng,latlng.lat];
  data.startMarker = L.marker(latlng).addTo(map).setIcon(mapConfig.startIcon);
}

var addEnd = function(map, latlng){
  clearSolution(map);
  if(data.endMarker){
    map.removeLayer(data.endMarker);
  }
  data.vehicles[0].end = [latlng.lng,latlng.lat];
  data.endMarker = L.marker(latlng).addTo(map).setIcon(mapConfig.endIcon);
}

var addJob = function(map, latlng){
  clearSolution(map);
  data.jobs.push({'location': [latlng.lng,latlng.lat]});
  data.jobsMarkers.push(L.marker(latlng)
                        .addTo(map)
                        .setIcon(mapConfig.jobIcon));
}

var removeJob = function(map, jobIndex){
  clearSolution(map);
  map.removeLayer(data.jobsMarkers[jobIndex]);
  data.jobs.splice(jobIndex, 1);
  data.jobsMarkers.splice(jobIndex, 1);
}

var removeStart = function(map){
  var allowRemoval = getEnd();
  if(allowRemoval){
    clearSolution(map);
    resetStart(map);
  }
  else{
    alert("Can't delete both start and end.");
  }
  return allowRemoval;
}

var removeEnd = function(map){
  var allowRemoval = getStart();
  if(allowRemoval){
    clearSolution(map);
    resetEnd(map);
  }
  else{
    alert("Can't delete both start and end.");
  }
  return allowRemoval;
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

var setOutput = function(output){
  data.output = output;
}

var getOutput = function(){
  return data.output;
}

var addRoute = function(map, route){
  var latlngs = polyUtil.decode(route['geometry']);

  routes.push(new L.Polyline(latlngs,
                             {opacity: mapConfig.opacity,
                              weight: mapConfig.weight}
                            ).addTo(map));
  map.fitBounds(latlngs, {
    paddingBottomRight: [panelControl.getWidth(), 0]
  });

  for(var i = 0; i < route.steps.length; i++){
    var step = route.steps[i];
    if(step.type === "job"){
      data.jobsMarkers[step.job].bindTooltip(i.toString(),{
        direction: 'auto',
        permanent: true,
        opacity: 0.9
      }).openTooltip();
    }
  }
}

module.exports = {
  getJobs: getJobs,
  getVehicles: getVehicles,
  getJobsSize: getJobsSize,
  getStart: getStart,
  getEnd: getEnd,
  clearData: clearData,
  closeAllPopups: closeAllPopups,
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
  showEnd: showEnd,
  setOutput: setOutput,
  getOutput: getOutput,
  addRoute: addRoute
};
