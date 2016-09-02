'use strict';

var data = require('../data');

var clearData = function(map){
  // Clear all data and markers.
  for(var i = 0; i < data.jobsMarkers.length; i++){
    map.removeLayer(data.jobsMarkers[i]);
  }

  // Init dataset.
  data.jobs = [];
  data.jobsMarkers = [];
  data.vehicles = [{'id': 0}];
}

module.exports = {
  clearData: clearData
};
