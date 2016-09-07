'use strict';

var clearControl = require('../controls/clear');
var dataHandler = require('./data_handler');
var geocoder = require('./geocoder');
var address = require('./address');
var solveControl = require('../controls/solve');

var checkSolveControl = function(map){
  if(!map.solveControl){
    if((dataHandler.getStart() || dataHandler.getEnd())
       && (dataHandler.getJobsSize() > 0)){
      solveControl.addTo(map);
    }
  }
  else{
    if(dataHandler.getJobsSize() === 0){
      map.removeControl(solveControl);
    }
  }
}

// Add locations.
var addPlace = function(map, latlng){
  if(!map.clearControl){
    map.addControl(clearControl);
  }
  if(dataHandler.isFirstPlace()){
    // Add vehicle start/end.
    dataHandler.firstPlaceSet();
    geocoder.nominatim.reverse(latlng, map.options.crs.scale(19), function(results){
      var r = results[0];
      if(r){
        var name = address.display(r);
        // Add description in the right panel display.
        dataHandler.addStart(map, latlng, name, checkSolveControl);
        dataHandler.addEnd(map, latlng, name, checkSolveControl);
      }
    });
  }
  else{
    // Add regular job.
    geocoder.nominatim.reverse(latlng, map.options.crs.scale(19), function(results){
      var r = results[0];
      if(r){
        var name = address.display(r);
        // Add job in dataset. This also adds description in the right
        // panel display and creates job marker.
        dataHandler.addJob(map, latlng, name, checkSolveControl);
        checkSolveControl(map);
      }
    });
  }
}

module.exports = {
  addPlace: addPlace
};
