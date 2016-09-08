'use strict';

var LSetup = require('../config/leaflet_setup');
var clearControl = require('../controls/clear');
var dataHandler = require('./data_handler');
var geocoder = require('./geocoder');
var address = require('./address');
var solveControl = require('../controls/solve');
var panelControl = require('../controls/panel');
var fitControl = require('../controls/fit');

var checkSolveControl = function(){
  if(!LSetup.map.solveControl){
    if((dataHandler.getStart() || dataHandler.getEnd())
       && (dataHandler.getJobsSize() > 0)){
      solveControl.addTo(LSetup.map);
    }
  }
  else{
    if(dataHandler.getJobsSize() === 0){
      LSetup.map.removeControl(solveControl);
    }
  }
}

// Add locations.
var addPlace = function(latlng, name){
  panelControl.hideInitDiv();

  if(!LSetup.map.fitControl){
    LSetup.map.addControl(fitControl);
  }
  if(!LSetup.map.clearControl){
    LSetup.map.addControl(clearControl);
  }
  if(dataHandler.isFirstPlace()){
    // Add vehicle start/end.
    dataHandler.firstPlaceSet();

    if(name){
      // Add start with provided name.
      dataHandler.addStart(latlng, name, checkSolveControl);
      dataHandler.addEnd(latlng, name, checkSolveControl);
    }
    else{
      geocoder.defaultGeocoder.reverse(latlng, LSetup.map.options.crs.scale(19), function(results){
        var r = results[0];
        if(r){
          name = address.display(r);
          // Add start based on geocoding result.
          dataHandler.addStart(latlng, name, checkSolveControl);
          dataHandler.addEnd(latlng, name, checkSolveControl);
        }
      });
    }
  }
  else{
    // Add regular job.
    if(name){
      // Add job with provided name.
      dataHandler.addJob(latlng, name, checkSolveControl);
      checkSolveControl();
    }
    else{
      geocoder.defaultGeocoder.reverse(latlng, LSetup.map.options.crs.scale(19), function(results){
        var r = results[0];
        if(r){
          name = address.display(r);
          // Add job based on geocoding result.
          dataHandler.addJob(latlng, name, checkSolveControl);
          checkSolveControl();
        }
      });
    }
  }
}

module.exports = {
  addPlace: addPlace
};
