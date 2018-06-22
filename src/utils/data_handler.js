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

var getVehicles = function() {
  return data.vehicles;
}

var getJobsSize = function() {
  return data.jobs.length;
}

var getNextJobId = function() {
  return data.maxJobId + 1;
}

var getNextVehicleId = function() {
  return data.maxVehicleId + 1;
}

var getVehiclesSize = function() {
  return data.vehicles.length;
}

var checkControls = function() {
  var hasJobs = getJobsSize() > 0;
  var hasVehicles = getVehiclesSize() > 0;
  if (hasJobs || hasVehicles) {
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
    if (hasVehicles && hasJobs) {
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

var _pushToBounds = function(coords) {
  if (data.bounds) {
    data.bounds.extend([coords[1], coords[0]]);
  } else {
    data.bounds = L.latLngBounds([coords[1], coords[0]],
                                 [coords[1], coords[0]]);
  }
}

var _recomputeBounds = function() {
  // Problem bounds are extended upon additions but they need to be
  // recalculated when a deletion might reduce the bounds.
  delete data.bounds;

  for (var i = 0; i < data.vehicles.length; i++) {
    var start = data.vehicles[i].start;
    if (start) {
      _pushToBounds(start);
    }
    var end = data.vehicles[i].end;
    if (end) {
      _pushToBounds(end);
    }
  }

  for (var i = 0; i < data.jobs.length; i++) {
    var loc = data.jobs[i].location;
    _pushToBounds(loc);
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

// Used upon addition to distinguish between start/end or job
// addition.
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
    for (var k in data.jobsMarkers) {
      if (data.jobsMarkers[k].getTooltip()) {
        LSetup.map.removeLayer(data.jobsMarkers[k].getTooltip());
      }
    }
    // Remove query output for this solution.
    delete data.output;
  }
}

var clearData = function() {
  // Back to adding a start/end for next place.
  _firstPlace = true;

  // Clear all data and markers.
  for (var k in data.jobsMarkers) {
    LSetup.map.removeLayer(data.jobsMarkers[k]);
    delete data.jobsMarkers[k];
  }
  for (var k in data.vehiclesMarkers) {
    LSetup.map.removeLayer(data.vehiclesMarkers[k]);
    delete data.vehiclesMarkers[k];
  }

  // Init dataset.
  data.jobs = [];
  data.vehicles = [];
  data.jobsMarkers = {};
  data.vehiclesMarkers = {};

  // Reset bounds.
  delete data.bounds;

  _clearSolution();
}

var closeAllPopups = function() {
  for (var k in data.jobsMarkers) {
    data.jobsMarkers[k].closePopup();
  }
  for (var k in data.vehiclesMarkers) {
    data.vehiclesMarkers[k].closePopup();
  }
}

var _setStart = function(v) {
  var vTable = document.getElementById('panel-vehicles-' + v.id.toString());

  vTable.deleteRow(1);
  var row = vTable.insertRow(1);
  var idCell = row.insertCell(0);

  var remove = function() {
    if (_removeStart(v)) {
      // Reset start row when removing is ok.
      vTable.deleteRow(1);
      vTable.insertRow(1);
      if (getJobsSize() === 0 && getVehiclesSize() === 0) {
        LSetup.map.removeControl(clearControl);
      }
      checkControls();
    }
  }
  idCell.setAttribute('class', 'delete-location');
  idCell.title = "Click to delete";
  idCell.onclick = remove;

  // Required when parsing json files with no start description.
  if (!v.startDescription) {
    v.startDescription = "Start";
  }

  var nameCell = row.insertCell(1);
  nameCell.title = "Click to center the map";
  nameCell.setAttribute("class", "vehicle-start");
  nameCell.appendChild(document.createTextNode(v.startDescription));
  nameCell.onclick = function() {
    _showStart(v, true);
  };

  // Marker and popup.
  data.vehiclesMarkers[v.id.toString() + '_start']
    = L.circleMarker([v.start[1], v.start[0]],
                     {
                       radius: 8,
                       weight: 3,
                       fillOpacity: 0.4,
                       color: '#48b605'
                     })
    .addTo(LSetup.map);

  var popupDiv = document.createElement('div');
  var par = document.createElement('p');
  par.innerHTML = "<b>Vehicle " + v.id.toString() + ": </b>" + v.startDescription;
  var deleteButton = document.createElement('button');
  deleteButton.innerHTML = 'Delete start';
  deleteButton.onclick = remove;
  popupDiv.appendChild(par);
  popupDiv.appendChild(deleteButton);

  data.vehiclesMarkers[v.id.toString() + '_start']
    .bindPopup(popupDiv)
    .openPopup();
}

var _setEnd = function(v) {
  var vTable = document.getElementById('panel-vehicles-' + v.id.toString());

  vTable.deleteRow(2);
  var row = vTable.insertRow(2);
  var idCell = row.insertCell(0);

  var remove = function() {
    if (_removeEnd(v)) {
      // Reset end row when removing is ok.
      vTable.deleteRow(2);
      vTable.insertRow(2);
      if (getJobsSize() === 0 && getVehiclesSize() === 0) {
        LSetup.map.removeControl(clearControl);
      }
      checkControls();
    }
  }
  idCell.setAttribute('class', 'delete-location');
  idCell.title = "Click to delete";
  idCell.onclick = remove;

  // Required when parsing json files with no end description.
  if (!v.endDescription) {
    v.endDescription = "End";
  }

  var nameCell = row.insertCell(1);
  nameCell.title = "Click to center the map";
  nameCell.setAttribute("class", "vehicle-end");
  nameCell.appendChild(document.createTextNode(v.endDescription));
  nameCell.onclick = function() {
    _showEnd(v, true);
  };

  // Marker and popup.
  data.vehiclesMarkers[v.id.toString() + '_end']
    = L.circleMarker([v.end[1], v.end[0]],
                     {
                       radius: 8,
                       weight: 3,
                       fillOpacity: 0.4,
                       color: '#e9130a'
                     })
    .addTo(LSetup.map);

  var popupDiv = document.createElement('div');
  var par = document.createElement('p');
  par.innerHTML =  "<b>Vehicle " + v.id.toString() + ": </b>" + v.endDescription;
  var deleteButton = document.createElement('button');
  deleteButton.innerHTML = 'Delete end';
  deleteButton.onclick = remove;
  popupDiv.appendChild(par);
  popupDiv.appendChild(deleteButton);

  data.vehiclesMarkers[v.id.toString() + '_end']
    .bindPopup(popupDiv)
    .openPopup();
}

var addVehicle = function(v) {
  _clearSolution();
  data.vehicles.push(v);

  data.maxVehicleId = Math.max(data.maxVehicleId, v.id);

  var tableId = 'panel-vehicles-' + v.id.toString();
  var vTable = document.getElementById(tableId);
  if (!vTable) {
    // Create new table for current vehicle.
    vTable = document.createElement('table');
    vTable.setAttribute('id', tableId);

    // Set title.
    var row = vTable.insertRow(0);

    var titleCell = row.insertCell(0);
    titleCell.setAttribute("class", "vehicle-title");
    titleCell.setAttribute("colspan", 2);
    titleCell.appendChild(document.createTextNode("Vehicle " + v.id.toString()));

    vTable.insertRow(1);
    vTable.insertRow(2);
    document.getElementById('panel-vehicles').appendChild(vTable);
  }

  if (v.start) {
    _pushToBounds(v.start);
    _setStart(v);
  }
  if (v.end) {
    _pushToBounds(v.end);
    _setEnd(v);
  }
}

var _jobDisplay = function(j) {
  var panelList = document.getElementById('panel-jobs');

  var nb_rows = panelList.rows.length;
  var row = panelList.insertRow(nb_rows);
  var idCell = row.insertCell(0);

  var remove = function() {
    _removeJob(j);
    panelList.deleteRow(row.rowIndex);
    if (getJobsSize() === 0 && getVehiclesSize() === 0) {
      LSetup.map.removeControl(clearControl);
    }
    checkControls();
  }
  idCell.setAttribute('class', 'delete-location');
  idCell.title = "Click to delete";
  idCell.onclick = remove;

  // Required when parsing json files containing jobs with no
  // description.
  if (!j.description) {
    j.description = "No description";
  }

  var nameCell = row.insertCell(1);
  nameCell.title = "Click to center the map";
  nameCell.appendChild(document.createTextNode(j.description));
  nameCell.onclick = function() {
    _showMarker(j, true);
  };
  // Callbacks to replace current start or end by this job.
  var setAsStart = function() {
    var marker = data.vehicles[0].id.toString() + '_start';
    LSetup.map.removeLayer(data.vehiclesMarkers[marker]);
    delete data.vehiclesMarkers[marker];
    data.vehicles[0].start = j.location;
    data.vehicles[0].startDescription = j.description;
    _setStart(data.vehicles[0]);

    _removeJob(j);
    panelList.deleteRow(row.rowIndex);
    checkControls();
  }
  var setAsEnd = function() {
    var marker = data.vehicles[0].id.toString() + '_end';
    LSetup.map.removeLayer(data.vehiclesMarkers[marker]);
    delete data.vehiclesMarkers[marker];
    data.vehicles[0].end = j.location;
    data.vehicles[0].endDescription = j.description;
    _setEnd(data.vehicles[0]);

    _removeJob(j);
    panelList.deleteRow(row.rowIndex);
    checkControls();
  }
  // Add description to job and marker.
  var popupDiv = document.createElement('div');
  var par = document.createElement('p');
  par.innerHTML = j.description;
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

  data.jobsMarkers[j.id.toString()].bindPopup(popupDiv).openPopup();
}

var addJob = function(j) {
  if (getJobsSize() >= api.maxJobNumber) {
    alert('Number of jobs can\'t exceed ' + api.maxJobNumber + '.');
    return;
  }

  _clearSolution();
  _pushToBounds(j.location);

  data.maxJobId = Math.max(data.maxJobId, j.id);
  data.jobs.push(j);
  data.jobsMarkers[j.id.toString()]
    = L.circleMarker([j.location[1], j.location[0]],
                     {
                       radius: 6,
                       weight: 3,
                       fillOpacity: 0.4
                     })
    .addTo(LSetup.map);

  // Handle display stuff.
  _jobDisplay(j);
}

var _removeJob = function(j) {
  _clearSolution();
  LSetup.map.removeLayer(data.jobsMarkers[j.id.toString()]);
  delete data.jobsMarkers[j.id.toString()];
  for (var i = 0; i < data.jobs.length; i++) {
    if (data.jobs[i].id == j.id) {
      data.jobs.splice(i, 1);
      break;
    }
  }
  _recomputeBounds();
}

var _removeStart = function(v) {
  var allowRemoval = v.end;
  if (allowRemoval) {
    _clearSolution();

    LSetup.map.removeLayer(data.vehiclesMarkers[v.id.toString() + '_start']);
    delete data.vehiclesMarkers[v.id.toString()];

    for (var i = 0; i < data.vehicles.length; i++) {
      if (data.vehicles[i].id == v.id) {
        delete data.vehicles.start;
        delete data.vehicles.startDescription;
        break;
      }
    }

    _recomputeBounds();
  } else {
    alert("Can't delete both start and end.");
  }
  return allowRemoval;
}

var _removeEnd = function(v) {
  var allowRemoval = v.start;
  if (allowRemoval) {
    _clearSolution();

    LSetup.map.removeLayer(data.vehiclesMarkers[v.id.toString() + '_end']);
    delete data.vehiclesMarkers[v.id.toString()];

    for (var i = 0; i < data.vehicles.length; i++) {
      if (data.vehicles[i].id == v.id) {
        delete data.vehicles[i].end;
        delete data.vehicles[i].endDescription;
        break;
      }
    }

    _recomputeBounds();
  } else {
    alert("Can't delete both start and end.");
  }
  return allowRemoval;
}

var _showMarker = function(j, center) {
  var k = j.id.toString();
  data.jobsMarkers[k].openPopup();
  if (center) {
    LSetup.map.panTo(data.jobsMarkers[k].getLatLng());
  }
}

var _showStart = function(v, center) {
  var k = v.id.toString() + '_start';
  data.vehiclesMarkers[k].openPopup();
  if (center) {
    LSetup.map.panTo(data.vehiclesMarkers[k].getLatLng());
  }
}

var _showEnd = function(v, center) {
  var k = v.id.toString() + '_end';
  data.vehiclesMarkers[k].openPopup();
  if (center) {
    LSetup.map.panTo(data.vehiclesMarkers[k].getLatLng());
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

  var jobIdToRank = {}
  for (var i = 0; i < data.jobs.length; i++) {
    jobIdToRank[data.jobs[i].id.toString()] = i;
  }

  var jobRank = 0;
  for (var i = 0; i < route.steps.length; i++) {
    var step = route.steps[i];
    if (step.type === "job") {
      jobRank++;

      var jobId = step.job.toString();
      // Set numbered label on marker.
      data.jobsMarkers[jobId].bindTooltip(jobRank.toString(),{
        direction: 'auto',
        permanent: true,
        opacity: LSetup.labelOpacity,
        className: 'rank'
      }).openTooltip();

      labelgunWrapper.addLabel(data.jobsMarkers[jobId], jobRank);

      // Add to solution display
      var nb_rows = solutionList.rows.length;
      var row = solutionList.insertRow(nb_rows);
      row.title = "Click to center the map";

      // Hack to make sure the marker index is right.
      var showCallback = function(rank) {
        return function() {_showMarker(data.jobs[rank], true);};
      }
      row.onclick = showCallback(jobIdToRank[jobId]);

      var idCell = row.insertCell(0);
      idCell.setAttribute('class', 'rank solution-display');
      idCell.innerHTML = jobRank;

      var nameCell = row.insertCell(1);
      nameCell.appendChild(
        document.createTextNode(data.jobs[jobIdToRank[jobId]].description)
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

  for (var k in data.jobsMarkers) {
    if (data.jobsMarkers[k].getTooltip()) {
      var jobRank = parseInt(data.jobsMarkers[k].getTooltip()._content);
      labelgunWrapper.addLabel(data.jobsMarkers[k], jobRank);
    }
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

  for (var i = 0; i < data.vehicles.length; i++) {
    addVehicle(data.vehicles[i]);
  }

  for (var i = 0; i < data.jobs.length; i++) {
    addJob(data.jobs[i]);
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
  getVehicles: getVehicles,
  setOutput: setOutput,
  getOutput: getOutput,
  addRoute: addRoute,
  getJobsSize: getJobsSize,
  getNextJobId: getNextJobId,
  getNextVehicleId: getNextVehicleId,
  closeAllPopups: closeAllPopups,
  isFirstPlace: isFirstPlace,
  firstPlaceSet: firstPlaceSet,
  addVehicle: addVehicle,
  addJob: addJob,
  checkControls: checkControls,
  animateRoute: animateRoute,
  setData: setData,
  setSolution: setSolution
};
