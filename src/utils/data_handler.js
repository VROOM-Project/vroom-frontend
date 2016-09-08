'use strict';

var L = require('leaflet');
var LSetup = require('../config/leaflet_setup');
var polyUtil = require('polyline-encoded');
var data = require('../data');
var LSetup = require('../config/leaflet_setup');
var panelControl = require('../controls/panel');
var clearControl = require('../controls/clear');
var summaryControl = require('../controls/summary');
var solveControl = require('../controls/solve');

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

var _resetStart = function(){
  if(data.startMarker){
    LSetup.map.removeLayer(data.startMarker);
    delete data.vehicles[0].startDescription;
    delete data.vehicles[0].start;
    data.startMarker = undefined;
  }
}

var _resetEnd = function(){
  if(data.endMarker){
    LSetup.map.removeLayer(data.endMarker);
    delete data.vehicles[0].endDescription;
    delete data.vehicles[0].end;
    data.endMarker = undefined;
  }
}

var hasSolution = function(){
  return routes.length > 0;
}

var _checkSolveControl = function(){
  if(!LSetup.map.solveControl){
    if((getStart() || getEnd()) && (getJobsSize() > 0)){
      solveControl.addTo(LSetup.map);
    }
  }
  else{
    if(getJobsSize() === 0){
      LSetup.map.removeControl(solveControl);
    }
  }
}

// Used on addition to distinguish between start/end or job
// addition. Relying on getStart / getEnd is not enough as the start
// and end are only set after the geocoding request is completed. See
// #12.
var _firstPlace = true;

var isFirstPlace = function(){
  return _firstPlace;
}

var firstPlaceSet = function(){
  _firstPlace = false;
}

var _clearSolution = function(){
  if(hasSolution()){
    // Back to input mode.
    panelControl.clearSolutionDisplay();
    panelControl.showJobDisplay();

    LSetup.map.removeLayer(routes[0]);
    LSetup.map.removeControl(summaryControl);

    routes = [];
    // Remove all numbered tooltips.
    for(var i = 0; i < data.jobsMarkers.length; i++){
      LSetup.map.removeLayer(data.jobsMarkers[i].getTooltip());
    }
    // Remove query output for this solution.
    delete data.output;
  }
}

var clearData = function(){
  // Back to adding a start/end for next place.
  _firstPlace = true;

  // Clear all data and markers.
  for(var i = 0; i < data.jobsMarkers.length; i++){
    LSetup.map.removeLayer(data.jobsMarkers[i]);
  }
  _resetStart();
  _resetEnd();

  // Init dataset.
  data.jobs = [];
  data.jobsMarkers = [];
  data.vehicles = [{'id': 0}];

  _clearSolution();
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

var _updateJobDescription = function(jobIndex,
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

var _updateStartDescription = function(description, remove){
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

var _updateEndDescription = function(description, remove){
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

var _setStart = function(latlng, name){
  var panelList = document.getElementById('panel-vehicle');

  panelList.deleteRow(0);
  var row = panelList.insertRow(0);
  var idCell = row.insertCell(0);

  var remove = function(){
    if(_removeStart()){
      // Reset start row when removing is ok.
      panelList.deleteRow(0);
      panelList.insertRow(0);
      if(getJobsSize() === 0
         && !getStart()
         && !getEnd()){
        LSetup.map.removeControl(clearControl);
      }
      _checkSolveControl();
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
    _showStart(true);
  };
  // Add description.
  _updateStartDescription(name, remove);
}

var addStart = function(latlng, name){
  _clearSolution();
  if(data.startMarker){
    LSetup.map.removeLayer(data.startMarker);
  }
  data.vehicles[0].start = [latlng.lng,latlng.lat];
  data.startMarker = L.marker(latlng).addTo(LSetup.map).setIcon(LSetup.startIcon);
  // Handle display stuff.
  _setStart(latlng, name);
}

var _setEnd = function(latlng, name){
  var panelList = document.getElementById('panel-vehicle');

  panelList.deleteRow(1);
  var row = panelList.insertRow(1);
  var idCell = row.insertCell(0);

  var remove = function(){
    if(_removeEnd()){
      // Reset end row when removing is ok.
      panelList.deleteRow(1);
      panelList.insertRow(1);
      if(getJobsSize() === 0
         && !getStart()
         && !getEnd()){
        LSetup.map.removeControl(clearControl);
      }
      _checkSolveControl();
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
    _showEnd(true);
  };
  // Add description.
  _updateEndDescription(name, remove);
}

var addEnd = function(latlng, name){
  _clearSolution();
  if(data.endMarker){
    LSetup.map.removeLayer(data.endMarker);
  }
  data.vehicles[0].end = [latlng.lng,latlng.lat];
  data.endMarker = L.marker(latlng).addTo(LSetup.map).setIcon(LSetup.endIcon);
  // Handle display stuff.
  _setEnd(latlng, name);
}

var _jobDisplay = function(latlng, name){
  var panelList = document.getElementById('panel-jobs');

  var nb_rows = panelList.rows.length;
  var row = panelList.insertRow(nb_rows);
  var idCell = row.insertCell(0);

  var remove = function(){
    _removeJob(row.rowIndex);
    panelList.deleteRow(row.rowIndex);
    if(getJobsSize() === 0
       && !getStart()
       && !getEnd()){
      LSetup.map.removeControl(clearControl);
    }
    _checkSolveControl();
  }
  idCell.setAttribute('class', 'delete-location');
  idCell.title = "Click to delete";
  idCell.onclick = remove;
  var nameCell = row.insertCell(1);
  nameCell.title = "Click to center the map";
  nameCell.appendChild(document.createTextNode(name));
  nameCell.onclick = function(){
    _showMarker(row.rowIndex, true);
  };
  // Callbacks to replace current start or end by this job.
  var setAsStart = function(){
    addStart(latlng, name);
    _removeJob(row.rowIndex);
    panelList.deleteRow(row.rowIndex);
    _checkSolveControl();
  }
  var setAsEnd = function(){
    addEnd(latlng, name);
    _removeJob(row.rowIndex);
    panelList.deleteRow(row.rowIndex);
    _checkSolveControl();
  }
  // Add description to job and marker.
  _updateJobDescription(getJobsSize() - 1,
                        name,
                        remove,
                        setAsStart,
                        setAsEnd);
}

var addJob = function(latlng, name){
  _clearSolution();
  data.jobs.push({'location': [latlng.lng,latlng.lat]});
  data.jobsMarkers.push(L.marker(latlng)
                        .addTo(LSetup.map)
                        .setIcon(LSetup.jobIcon));
  // Handle display stuff.
  _jobDisplay(latlng, name);
  _checkSolveControl();
}

var _removeJob = function(jobIndex){
  _clearSolution();
  LSetup.map.removeLayer(data.jobsMarkers[jobIndex]);
  data.jobs.splice(jobIndex, 1);
  data.jobsMarkers.splice(jobIndex, 1);
}

var _removeStart = function(){
  var allowRemoval = getEnd();
  if(allowRemoval){
    _clearSolution();
    _resetStart();
  }
  else{
    alert("Can't delete both start and end.");
  }
  return allowRemoval;
}

var _removeEnd = function(){
  var allowRemoval = getStart();
  if(allowRemoval){
    _clearSolution();
    _resetEnd();
  }
  else{
    alert("Can't delete both start and end.");
  }
  return allowRemoval;
}

var _showMarker = function(markerIndex, center){
  data.jobsMarkers[markerIndex].openPopup();
  if(center){
    LSetup.map.panTo(data.jobsMarkers[markerIndex].getLatLng());
  }
}

var _showStart = function(center){
  data.startMarker.openPopup();
  if(center){
    LSetup.map.panTo(data.startMarker.getLatLng());
  }
}

var _showEnd = function(center){
  data.endMarker.openPopup();
  if(center){
    LSetup.map.panTo(data.endMarker.getLatLng());
  }
}

var setOutput = function(output){
  data.output = output;
}

var getOutput = function(){
  return data.output;
}

var addRoute = function(route){
  var latlngs = polyUtil.decode(route['geometry']);

  var path = new L.Polyline(latlngs, {
    opacity: LSetup.opacity,
    weight: LSetup.weight}).addTo(LSetup.map);

  LSetup.map.fitBounds(latlngs, {
    paddingBottomRight: [panelControl.getWidth(), 0]
  });

  // Hide input job display.
  panelControl.hideJobDisplay();

  var solutionList = document.getElementById('panel-solution');

  var jobRank = 0;
  for(var i = 0; i < route.steps.length; i++){
    var step = route.steps[i];
    if(step.type === "job"){
      jobRank++;

      var jobIndex = step.job;
      // Set numbered label on marker.
      data.jobsMarkers[jobIndex].bindTooltip(jobRank.toString(),{
        direction: 'auto',
        permanent: true,
        opacity: 0.9,
        className: 'rank'
      }).openTooltip();

      // Add to solution display
      var nb_rows = solutionList.rows.length;
      var row = solutionList.insertRow(nb_rows);
      row.title = "Click to center the map";

      // Hack to make sure the marker index is right.
      var showCallback = function(index){
        return function(){_showMarker(index, true);};
      }
      row.onclick = showCallback(jobIndex);


      var idCell = row.insertCell(0);
      idCell.setAttribute('class', 'rank solution-display');
      idCell.innerHTML = jobRank;

      var nameCell = row.insertCell(1);
      nameCell.appendChild(
        document.createTextNode(data.jobs[jobIndex].description)
      );
    }
  }

  // Remember the path. This will cause hasSolution() to return true.
  routes.push(path);
}

module.exports = {
  clearData: clearData,
  getJobs: getJobs,
  getJobsMarkers: getJobsMarkers,
  getVehicles: getVehicles,
  setOutput: setOutput,
  getOutput: getOutput,
  addRoute: addRoute,
  getJobsSize: getJobsSize,
  getStart: getStart,
  getEnd: getEnd,
  closeAllPopups: closeAllPopups,
  isFirstPlace: isFirstPlace,
  firstPlaceSet: firstPlaceSet,
  addStart: addStart,
  addEnd: addEnd,
  addJob: addJob
};
