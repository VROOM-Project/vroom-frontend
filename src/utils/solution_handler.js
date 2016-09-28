'use strict';

var dataHandler = require('./data_handler');
var api = require('../config/api');
var summaryControl = require('../controls/summary');
var LSetup = require('../config/leaflet_setup');

var solve = function(){
  // Format json input for solving.
  var input = {
    jobs: dataHandler.getJobs(),
    vehicles: dataHandler.getVehicles(),
    "options":{
      "g": true
    }
  };
  var markers = dataHandler.getJobsMarkers();
  for(var i = 0; i < input.jobs.length; i++){
    // Job id is simply its rank in data.jobs. Remembering this rank
    // for markers too as it is required for further sorting according
    // to the solution order.
    input.jobs[i].id = i;
    markers[i].id = i;
  }

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
      dataHandler.setOutput(JSON.parse(xhttp.response));
      document.getElementById('wait-icon').removeAttribute('class');
      plotSolution();
    }
  };
  var target = api.host;
  if(api.port){
    target += ':' + api.port;
  }
  xhttp.open('POST', target, false);
  xhttp.setRequestHeader('Content-type', 'application/json');
  xhttp.send(JSON.stringify(input));
  dataHandler.closeAllPopups();
}

var plotSolution = function(){
  var result = dataHandler.getOutput();
  if(result['code'] !== 0){
    alert(result['error']);
    return;
  }

  summaryControl.addTo(LSetup.map);
  summaryControl.update(result);
  dataHandler.addRoute(result.routes[0]);
}

module.exports = {
  solve: solve
};
