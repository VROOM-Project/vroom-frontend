'use strict';

var L = require('leaflet');
var polyUtil = require('polyline-encoded');
var data = require('../data');
var mapConfig = require('../config/leaflet');
var panelControl = require('../controls/panel');
var clearControl = require('../controls/clear');

var routes = [];

var getJobs = function(){
  return data.jobs;
}

var getJobsMarkers = function(){
  return data.jobsMarkers;
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

var hasSolution = function(){
  return routes.length > 0;
}

var clearSolution = function(map){
  if(hasSolution()){
    map.removeLayer(routes[0]);
    routes = [];
    // Remove all numbered tooltips.
    for(var i = 0; i < data.jobsMarkers.length; i++){
      map.removeLayer(data.jobsMarkers[i].getTooltip());
    }
    // Remove query output for this solution.
    delete data.output;
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

var _setStart = function(map, latlng, name){
  var panelList = document.getElementById('panel-vehicle');

  panelList.deleteRow(0);
  var row = panelList.insertRow(0);
  var idCell = row.insertCell(0);

  var remove = function(){
    if(removeStart(map)){
      // Reset start row when removing is ok.
      panelList.deleteRow(0);
      panelList.insertRow(0);
      if(getJobsSize() === 0
         && !getStart()
         && !getEnd()){
        map.removeControl(clearControl);
      }
    }
  }
  idCell.setAttribute('class', 'delete-location');
  idCell.title = "Click to delete";
  idCell.onclick = remove;
  var nameCell = row.insertCell(1);
  nameCell.title = "Click to center the map";
  nameCell.setAttribute("class", "vehicle-start");
  nameCell.appendChild(document.createTextNode(name));
  nameCell.onclick = function(){
    showStart(map, true);
  };
  // Add description.
  updateStartDescription(name, remove);
}

var addStart = function(map, latlng, name){
  clearSolution(map);
  if(data.startMarker){
    map.removeLayer(data.startMarker);
  }
  data.vehicles[0].start = [latlng.lng,latlng.lat];
  data.startMarker = L.marker(latlng).addTo(map).setIcon(mapConfig.startIcon);
  // Handle display stuff.
  _setStart(map, latlng, name);
}

var _setEnd = function(map, latlng, name){
  var panelList = document.getElementById('panel-vehicle');

  panelList.deleteRow(1);
  var row = panelList.insertRow(1);
  var idCell = row.insertCell(0);

  var remove = function(){
    if(removeEnd(map)){
      // Reset end row when removing is ok.
      panelList.deleteRow(1);
      panelList.insertRow(1);
      if(getJobsSize() === 0
         && !getStart()
         && !getEnd()){
        map.removeControl(clearControl);
      }
    }
  }
  idCell.setAttribute('class', 'delete-location');
  idCell.title = "Click to delete";
  idCell.onclick = remove;
  var nameCell = row.insertCell(1);
  nameCell.title = "Click to center the map";
  nameCell.setAttribute("class", "vehicle-end");
  nameCell.appendChild(document.createTextNode(name));
  nameCell.onclick = function(){
    showEnd(map, true);
  };
  // Add description.
  updateEndDescription(name, remove);
}

var addEnd = function(map, latlng, name){
  clearSolution(map);
  if(data.endMarker){
    map.removeLayer(data.endMarker);
  }
  data.vehicles[0].end = [latlng.lng,latlng.lat];
  data.endMarker = L.marker(latlng).addTo(map).setIcon(mapConfig.endIcon);
  // Handle display stuff.
  _setEnd(map, latlng, name)
}

var _jobDisplay = function(map, latlng, name, removeCB){
  var panelList = document.getElementById('panel-jobs');

  var nb_rows = panelList.rows.length;
  var row = panelList.insertRow(nb_rows);
  var idCell = row.insertCell(0);

  var remove = function(){
    removeJob(map, row.rowIndex);
    panelList.deleteRow(row.rowIndex);
    if(getJobsSize() === 0
       && !getStart()
       && !getEnd()){
      map.removeControl(clearControl);
    }
    removeCB(map);
  }
  idCell.setAttribute('class', 'delete-location');
  idCell.title = "Click to delete";
  idCell.onclick = remove;
  var nameCell = row.insertCell(1);
  nameCell.title = "Click to center the map";
  nameCell.appendChild(document.createTextNode(name));
  nameCell.onclick = function(){
    showMarker(map, row.rowIndex, true);
  };
  // Callbacks to replace current start or end by this job.
  var setAsStart = function(){
    addStart(map, latlng, name);
    removeJob(map, row.rowIndex);
    panelList.deleteRow(row.rowIndex);
    removeCB(map);
  }
  var setAsEnd = function(){
    addEnd(map, latlng, name);
    removeJob(map, row.rowIndex);
    panelList.deleteRow(row.rowIndex);
    removeCB(map);
  }
  // Add description to job and marker.
  updateJobDescription(getJobsSize() - 1,
                       name,
                       remove,
                       setAsStart,
                       setAsEnd);
}

var addJob = function(map, latlng, name, removeCB){
  clearSolution(map);
  data.jobs.push({'location': [latlng.lng,latlng.lat]});
  data.jobsMarkers.push(L.marker(latlng)
                        .addTo(map)
                        .setIcon(mapConfig.jobIcon));
  // Handle display stuff.
  _jobDisplay(map, latlng, name, removeCB);
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

  var path = new L.Polyline(latlngs, {
    opacity: mapConfig.opacity,
    weight: mapConfig.weight}).addTo(map);

  map.fitBounds(latlngs, {
    paddingBottomRight: [panelControl.getWidth(), 0]
  });

  // Clear current job display.
  panelControl.clearJobDisplay();

  // Add tooltips to markers for visit rank and remember the ordering.
  var ordering = [];

  for(var i = 0; i < route.steps.length; i++){
    var step = route.steps[i];
    if(step.type === "job"){
      data.jobsMarkers[step.job].bindTooltip(i.toString(),{
        direction: 'auto',
        permanent: true,
        opacity: 0.9
      }).openTooltip();

      ordering.push(step.job);
    }
  }

  // Reorder jobs and marker according to the solution ordering.
  var solutionOrdering = function(a, b){
    return (ordering.indexOf(a.id) - ordering.indexOf(b.id));
  }
  data.jobs.sort(solutionOrdering);
  data.jobsMarkers.sort(solutionOrdering);

  for(var i = 0; i < data.jobs.length; i++){
    console.log(data.jobs[i].id + ' ' + data.jobs[i]["description"]);
  }

  routes.push(path);
}

module.exports = {
  getJobs: getJobs,
  getJobsMarkers: getJobsMarkers,
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
