'use strict';

var dataHandler = require('./data_handler');
var api = require('../config/api');

var solve = function(){
  // Format json input for solving.
  var input = {
    jobs: dataHandler.getJobs(),
    vehicles: dataHandler.getVehicles(),
    "options":{
      "g": true
    }
  };
  for(var i = 0; i < input.jobs.length; i++){
    // Job id is simply its rank in data.jobs.
    input.jobs[i].id = i;
  }

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
      dataHandler.setOutput(JSON.parse(xhttp.response));
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
}

var plotSolution = function(){
  var result = dataHandler.getOutput();
  if(result['code'] !== 0){
    alert(result['error']);
    return;
  }

  console.log(result);
}

module.exports = {
  solve: solve,
  plotSolution: plotSolution
};
