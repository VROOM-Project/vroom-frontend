'use strict';

var dataHandler = require('./data_handler');
var api = require('../config/api');

var query = function() {
  var request = dataHandler.getOverpassQuery();
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4) {
      if (xhttp.status == 200) {
        applyResponse(JSON.parse(xhttp.response));
      } else {
        alert('Error: ' + xhttp.status);
      }
    }
  };
  xhttp.open('POST', api.overpassEndpoint, false);
  xhttp.setRequestHeader('Content-Type', 'application/json');
  xhttp.send(request);
  dataHandler.closeAllPopups();
}

var applyResponse = function(response) {
  dataHandler.setOverpassData(response['elements']);
  dataHandler.checkControls();
  document.getElementById('wait-icon').removeAttribute('class');
}

module.exports = {
  query: query,
  applyResponse: applyResponse
}
