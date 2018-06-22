'use strict';

var dataHandler = require('./data_handler');
var api = require('../config/api');
var summaryControl = require('../controls/summary');

var solve = function() {
  // Format json input for solving.
  var input = {
    jobs: dataHandler.getJobs(),
    vehicles: dataHandler.getVehicles(),
    "options":{
      "g": true
    }
  };

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4) {
      document.getElementById('wait-icon').removeAttribute('class');
      if (xhttp.status == 200) {
        dataHandler.setOutput(JSON.parse(xhttp.response));
        plotSolution();
      } else {
        alert('Error: ' + xhttp.status);
      }
    }
  };
  var target = api.host;
  if (api.port) {
    target += ':' + api.port;
  }
  xhttp.open('POST', target, false);
  xhttp.setRequestHeader('Content-type', 'application/json');
  xhttp.send(JSON.stringify(input));
  dataHandler.closeAllPopups();
}

var plotSolution = function() {
  var result = dataHandler.getOutput();
  if (result['code'] !== 0) {
    alert(result['error']);
    return;
  }

  dataHandler.markUnassigned(result.unassigned);
  dataHandler.addRoutes(result.routes);
  dataHandler.checkControls();
  summaryControl.update(result);
}

module.exports = {
  solve: solve,
  plotSolution: plotSolution
};
