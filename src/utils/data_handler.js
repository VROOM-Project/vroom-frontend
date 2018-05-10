'use strict';

var LSetup = require('../config/leaflet_setup');
var api = require('../config/api');
require('leaflet.polyline.snakeanim');

var polyUtil = require('@mapbox/polyline');
var data = require('../data');
var panelControl = require('../controls/panel');
var collapseControl = require('../controls/collapse');
var fitControl = require('../controls/fit');
var clearControl = require('../controls/clear');
var solveControl = require('../controls/solve');
var summaryControl = require('../controls/summary');
var snakeControl = require('../controls/snake');
var labelgunWrapper = require('./labelgun_wrapper');

var routes = [];

var getJobs = function() {
  return data.jobs;
}

var getJobsMarkers = function() {
  return data.jobsMarkers;
}

var getVehicles = function() {
  return data.vehicles;
}

var getJobsSize = function() {
  return data.jobs.length;
}

var getStart = function() {
  return data.vehicles[0].start;
}

var getEnd = function() {
  return data.vehicles[0].end;
}

var checkControls = function() {
  var hasJobs = getJobsSize() > 0;
  var hasStart = getStart();
  var hasEnd = getEnd();
  if (hasJobs || hasStart || hasEnd) {
    // Fit and clear controls as soon as we have a location.
    if (!LSetup.map.fitControl) {
      LSetup.map.addControl(fitControl);
    }
    if (!LSetup.map.clearControl) {
      LSetup.map.addControl(clearControl);
    }
  }
  if (!LSetup.map.solveControl) {
    // Solve control appears only when there's enough input to fire a
    // solving query.
    if ((hasStart || hasEnd) && hasJobs) {
      solveControl.addTo(LSetup.map);
    }
  } else {
    if (getJobsSize() === 0) {
      LSetup.map.removeControl(solveControl);
    }
  }
  if (hasSolution()) {
    LSetup.map.removeControl(solveControl);
    LSetup.map.addControl(summaryControl);
    LSetup.map.addControl(snakeControl);
  }
}

var _resetStart = function() {
  if (data.startMarker) {
    LSetup.map.removeLayer(data.startMarker);
    delete data.vehicles[0].startDescription;
    delete data.vehicles[0].start;
    data.startMarker = undefined;
  }
}

var _resetEnd = function() {
  if (data.endMarker) {
    LSetup.map.removeLayer(data.endMarker);
    delete data.vehicles[0].endDescription;
    delete data.vehicles[0].end;
    data.endMarker = undefined;
  }
}

var _pushToBounds = function(latlng) {
  if (data.bounds) {
    data.bounds.extend(latlng);
  } else {
    data.bounds = L.latLngBounds(latlng, latlng);
  }
}

var _recomputeBounds = function() {
  // Problem bounds are extended upon additions but they need to be
  // recalculated when a deletion might reduce the bounds.
  delete data.bounds;

  var start = data.vehicles[0].start;
  if (start) {
    _pushToBounds([start[1], start[0]]);
  }
  var end = data.vehicles[0].end;
  if (end) {
    _pushToBounds([end[1], end[0]]);
  }
  for (var i = 0; i < data.jobs.length; i++) {
    var loc = data.jobs[i].location;
    _pushToBounds([loc[1], loc[0]]);
  }
}

var fitView = function() {
  if (data.bounds) {
    LSetup.map.fitBounds(data.bounds, {
      paddingBottomRight: [panelControl.getWidth(), 0],
      paddingTopLeft: [50, 0],
    });
  }
}

var hasSolution = function() {
  return routes.length > 0;
}

// Used on addition to distinguish between start/end or job
// addition. Relying on getStart / getEnd is not enough as the start
// and end are only set after the geocoding request is completed. See
// #12.
var _firstPlace = true;

var isFirstPlace = function() {
  return _firstPlace;
}

var firstPlaceSet = function() {
  _firstPlace = false;
}

var _clearSolution = function() {
  if (hasSolution()) {
    // Back to input mode.
    panelControl.clearSolutionDisplay();
    panelControl.showJobDisplay();

    LSetup.map.removeLayer(routes[0]);
    LSetup.map.removeControl(summaryControl);
    LSetup.map.removeControl(snakeControl);

    routes = [];
    // Remove all numbered tooltips.
    for (var i = 0; i < data.jobsMarkers.length; i++) {
      LSetup.map.removeLayer(data.jobsMarkers[i].getTooltip());
    }
    // Remove query output for this solution.
    delete data.output;
  }
}

var clearData = function() {
  // Back to adding a start/end for next place.
  _firstPlace = true;

  // Clear all data and markers.
  for (var i = 0; i < data.jobsMarkers.length; i++) {
    LSetup.map.removeLayer(data.jobsMarkers[i]);
  }
  _resetStart();
  _resetEnd();

  // Init dataset.
  data.jobs = [];
  data.jobsMarkers = [];
  data.vehicles = [{'id': 0}];

  // Reset bounds.
  delete data.bounds;

  _clearSolution();
}

var closeAllPopups = function() {
  for (var i = 0; i < data.jobsMarkers.length; i++) {
    data.jobsMarkers[i].closePopup();
  }
  if (data.startMarker) {
    data.startMarker.closePopup();
  }
  if (data.endMarker) {
    data.endMarker.closePopup();
  }
}

var _updateJobDescription = function(jobIndex,
                                     description,
                                     remove,
                                     setAsStart,
                                     setAsEnd) {
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

var _updateStartDescription = function(description, remove) {
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

var _updateEndDescription = function(description, remove) {
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

var _setStart = function(latlng, name) {
  var panelList = document.getElementById('panel-vehicle');

  panelList.deleteRow(0);
  var row = panelList.insertRow(0);
  var idCell = row.insertCell(0);

  var remove = function() {
    if (_removeStart()) {
      // Reset start row when removing is ok.
      panelList.deleteRow(0);
      panelList.insertRow(0);
      if (getJobsSize() === 0
         && !getStart()
         && !getEnd()) {
        LSetup.map.removeControl(clearControl);
      }
      checkControls();
    }
  }
  idCell.setAttribute('class', 'delete-location');
  idCell.title = "Click to delete";
  idCell.onclick = remove;

  // Required when parsing json files with no start description.
  if (!name) {
    name = "Start";
  }

  var nameCell = row.insertCell(1);
  nameCell.title = "Click to center the map";
  nameCell.setAttribute("class", "vehicle-start");
  nameCell.appendChild(document.createTextNode(name));
  nameCell.onclick = function() {
    _showStart(true);
  };
  // Add description.
  _updateStartDescription(name, remove);
}

var addStart = function(latlng, name) {
  _clearSolution();
  _pushToBounds(latlng);

  if (data.startMarker) {
    LSetup.map.removeLayer(data.startMarker);
  }
  data.vehicles[0].start = [latlng.lng,latlng.lat];
  data.startMarker = L.marker(latlng).addTo(LSetup.map).setIcon(LSetup.startIcon);
  // Handle display stuff.
  _setStart(latlng, name);
}

var _setEnd = function(latlng, name) {
  var panelList = document.getElementById('panel-vehicle');

  panelList.deleteRow(1);
  var row = panelList.insertRow(1);
  var idCell = row.insertCell(0);

  var remove = function() {
    if (_removeEnd()) {
      // Reset end row when removing is ok.
      panelList.deleteRow(1);
      panelList.insertRow(1);
      if (getJobsSize() === 0
         && !getStart()
         && !getEnd()) {
        LSetup.map.removeControl(clearControl);
      }
      checkControls();
    }
  }
  idCell.setAttribute('class', 'delete-location');
  idCell.title = "Click to delete";
  idCell.onclick = remove;

  // Required when parsing json files with no end description.
  if (!name) {
    name = "End";
  }

  var nameCell = row.insertCell(1);
  nameCell.title = "Click to center the map";
  nameCell.setAttribute("class", "vehicle-end");
  nameCell.appendChild(document.createTextNode(name));
  nameCell.onclick = function() {
    _showEnd(true);
  };
  // Add description.
  _updateEndDescription(name, remove);
}

var addEnd = function(latlng, name) {
  _clearSolution();
  _pushToBounds(latlng);

  if (data.endMarker) {
    LSetup.map.removeLayer(data.endMarker);
  }
  data.vehicles[0].end = [latlng.lng,latlng.lat];
  data.endMarker = L.marker(latlng).addTo(LSetup.map).setIcon(LSetup.endIcon);
  // Handle display stuff.
  _setEnd(latlng, name);
}

var _jobDisplay = function(latlng, name) {
  var panelList = document.getElementById('panel-jobs');

  var nb_rows = panelList.rows.length;
  var row = panelList.insertRow(nb_rows);
  var idCell = row.insertCell(0);

  var remove = function() {
    _removeJob(row.rowIndex);
    panelList.deleteRow(row.rowIndex);
    if (getJobsSize() === 0
       && !getStart()
       && !getEnd()) {
      LSetup.map.removeControl(clearControl);
    }
    checkControls();
  }
  idCell.setAttribute('class', 'delete-location');
  idCell.title = "Click to delete";
  idCell.onclick = remove;

  // Required when parsing json files containing jobs with no
  // description.
  if (!name) {
    name = "No description";
  }

  var nameCell = row.insertCell(1);
  nameCell.title = "Click to center the map";
  nameCell.appendChild(document.createTextNode(name));
  nameCell.onclick = function() {
    _showMarker(row.rowIndex, true);
  };
  // Callbacks to replace current start or end by this job.
  var setAsStart = function() {
    addStart(latlng, name);
    _removeJob(row.rowIndex);
    panelList.deleteRow(row.rowIndex);
    checkControls();
  }
  var setAsEnd = function() {
    addEnd(latlng, name);
    _removeJob(row.rowIndex);
    panelList.deleteRow(row.rowIndex);
    checkControls();
  }
  // Add description to job and marker.
  _updateJobDescription(getJobsSize() - 1,
                        name,
                        remove,
                        setAsStart,
                        setAsEnd);
}

var addJob = function(latlng, name) {
  if (getJobsSize() >= api.maxJobNumber) {
    alert('Number of jobs can\'t exceed ' + api.maxJobNumber + '.');
    return;
  }

  _clearSolution();
  _pushToBounds(latlng);

  data.jobs.push({'location': [latlng.lng,latlng.lat]});
  data.jobsMarkers.push(L.marker(latlng)
                        .addTo(LSetup.map)
                        .setIcon(LSetup.jobIcon));
  // Handle display stuff.
  _jobDisplay(latlng, name);
}

var _removeJob = function(jobIndex) {
  _clearSolution();
  LSetup.map.removeLayer(data.jobsMarkers[jobIndex]);
  data.jobs.splice(jobIndex, 1);
  data.jobsMarkers.splice(jobIndex, 1);
  _recomputeBounds();
}

var _removeStart = function() {
  var allowRemoval = getEnd();
  if (allowRemoval) {
    _clearSolution();
    _resetStart();
    _recomputeBounds();
  } else {
    alert("Can't delete both start and end.");
  }
  return allowRemoval;
}

var _removeEnd = function() {
  var allowRemoval = getStart();
  if (allowRemoval) {
    _clearSolution();
    _resetEnd();
    _recomputeBounds();
  } else {
    alert("Can't delete both start and end.");
  }
  return allowRemoval;
}

var _showMarker = function(markerIndex, center) {
  data.jobsMarkers[markerIndex].openPopup();
  if (center) {
    LSetup.map.panTo(data.jobsMarkers[markerIndex].getLatLng());
  }
}

var _showStart = function(center) {
  data.startMarker.openPopup();
  if (center) {
    LSetup.map.panTo(data.startMarker.getLatLng());
  }
}

var _showEnd = function(center) {
  data.endMarker.openPopup();
  if (center) {
    LSetup.map.panTo(data.endMarker.getLatLng());
  }
}

var setOutput = function(output) {
  data.output = output;
}

var getOutput = function() {
  return data.output;
}

var addRoute = function(route) {
  var latlngs = polyUtil.decode(route['geometry']);

  var path = new L.Polyline(latlngs, {
    opacity: LSetup.opacity,
    weight: LSetup.weight,
    snakingSpeed: LSetup.snakingSpeed}).addTo(LSetup.map);

  data.bounds.extend(latlngs);
  fitView();

  // Hide input job display.
  panelControl.hideJobDisplay();

  var solutionList = document.getElementById('panel-solution');

  var jobRank = 0;
  var totalRank = route.steps.length
  for (var i = 0; i < totalRank; i++) {
    var step = route.steps[i];
    if (step.type === "job") {
      jobRank++;

      var jobIndex = step.job;
      // Set numbered label on marker.
      data.jobsMarkers[jobIndex].bindTooltip(jobRank.toString(),{
        direction: 'auto',
        permanent: true,
        opacity: LSetup.labelOpacity,
        className: 'rank'
      }).openTooltip();

      labelgunWrapper.addLabel(data.jobsMarkers[jobIndex], jobRank);

      // Add to solution display
      var nb_rows = solutionList.rows.length;
      var row = solutionList.insertRow(nb_rows);
      row.title = "Click to center the map";

      // Hack to make sure the marker index is right.
      var showCallback = function(index) {
        return function() {_showMarker(index, true);};
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
  labelgunWrapper.update();

  // Remember the path. This will cause hasSolution() to return true.
  routes.push(path);
}

var animateRoute = function() {
  closeAllPopups();
  routes[0].snakeIn();
}

/*** Events ***/

// Fit event.
LSetup.map.on('fit', fitView);

// Clear event.
LSetup.map.on('clear', function() {
  // Remove controls.
  if (LSetup.map.fitControl) {
    LSetup.map.removeControl(LSetup.map.fitControl);
  }
  if (LSetup.map.clearControl) {
    LSetup.map.removeControl(LSetup.map.clearControl);
  }
  if (LSetup.map.solveControl) {
    LSetup.map.removeControl(LSetup.map.solveControl);
  }
  if (LSetup.map.summaryControl) {
    LSetup.map.removeControl(LSetup.map.summaryControl);
  }
  if (LSetup.map.snakeControl) {
    LSetup.map.removeControl(LSetup.map.snakeControl);
  }
  clearData();

  // Delete locations display in the right panel.
  LSetup.map.panelControl.clearDisplay();
});

LSetup.map.on('animate', animateRoute);

// Collapse panel.
LSetup.map.on('collapse', function() {
  LSetup.map.collapseControl.toggle();
  LSetup.map.panelControl.toggle();
});

var resetLabels = function() {
  labelgunWrapper.destroy();

  var total = data.jobsMarkers.length;
  for (var i = 0; i < total; i++) {
    var jobRank = parseInt(data.jobsMarkers[i].getTooltip()._content);
    labelgunWrapper.addLabel(data.jobsMarkers[i], jobRank);
  }

  labelgunWrapper.update();
}

LSetup.map.on({
  zoomend: function() {
    if (hasSolution()) {
      resetLabels();
    }
  }
});

/*** end Events ***/

var setData = function(data) {
  clearData();

  var start = data.vehicles[0].start;
  if (start) {
    addStart(L.latLng(start[1], start[0]), data.vehicles[0].startDescription);
  }

  var end = data.vehicles[0].end;
  if (end) {
    addEnd(L.latLng(end[1], end[0]), data.vehicles[0].endDescription);
  }

  for (var i = 0; i < data.jobs.length; i++) {
    var job = data.jobs[i];
    addJob(L.latLng(job.location[1], job.location[0]),
           job.description,
           true);
  }

  // Next user input should be a job.
  firstPlaceSet();
}

var setSolution = function(data) {
  if ('output' in data) {
    setOutput(data.output);
  }
}

module.exports = {
  fitView: fitView,
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
  addJob: addJob,
  checkControls: checkControls,
  animateRoute: animateRoute,
  setData: setData,
  setSolution: setSolution
};
