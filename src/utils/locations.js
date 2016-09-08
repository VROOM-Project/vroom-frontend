'use strict';

var clearControl = require('../controls/clear');
var dataHandler = require('./data_handler');
var geocoder = require('./geocoder');
var address = require('./address');
var solveControl = require('../controls/solve');
var panelControl = require('../controls/panel');

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
var addPlace = function(map, latlng, name){
  panelControl.hideInitDiv();

  if(!map.clearControl){
    map.addControl(clearControl);
  }
  if(dataHandler.isFirstPlace()){
    // Add vehicle start/end.
    dataHandler.firstPlaceSet();

    if(name){
      // Add start with provided name.
      dataHandler.addStart(map, latlng, name, checkSolveControl);
      dataHandler.addEnd(map, latlng, name, checkSolveControl);
    }
    else{
      geocoder.defaultGeocoder.reverse(latlng, map.options.crs.scale(19), function(results){
        var r = results[0];
        if(r){
          name = address.display(r);
          // Add start based on geocoding result.
          dataHandler.addStart(map, latlng, name, checkSolveControl);
          dataHandler.addEnd(map, latlng, name, checkSolveControl);
        }
      });
    }
  }
  else{
    // Add regular job.
    if(name){
      // Add job with provided name.
      dataHandler.addJob(map, latlng, name, checkSolveControl);
      checkSolveControl(map);
    }
    else{
      geocoder.defaultGeocoder.reverse(latlng, map.options.crs.scale(19), function(results){
        var r = results[0];
        if(r){
          name = address.display(r);
          // Add job based on geocoding result.
          dataHandler.addJob(map, latlng, name, checkSolveControl);
          checkSolveControl(map);
        }
      });
    }
  }
}

module.exports = {
  addPlace: addPlace
};
