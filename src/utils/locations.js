'use strict';

var LSetup = require('../config/leaflet_setup');
var clearControl = require('../controls/clear');
var dataHandler = require('./data_handler');
var geocoder = require('./geocoder');
var address = require('./address');
var solveControl = require('../controls/solve');
var panelControl = require('../controls/panel');
var fitControl = require('../controls/fit');

var checkControls = function(){
  var hasJobs = (dataHandler.getJobsSize() > 0);
  var hasStart = dataHandler.getStart();
  var hasEnd = dataHandler.getEnd();
  if(hasJobs || hasStart || hasEnd){
    // Fit and clear controls as soon as we have a location.
    if(!LSetup.map.fitControl){
      LSetup.map.addControl(fitControl);
    }
    if(!LSetup.map.clearControl){
      LSetup.map.addControl(clearControl);
    }
  }
  if(!LSetup.map.solveControl){
    // Solve control appears only when there's enough input to fire a
    // solving query.
    if((hasStart || hasEnd) && hasJobs){
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

  if(dataHandler.isFirstPlace()){
    // Add vehicle start/end.
    dataHandler.firstPlaceSet();

    if(name){
      // Add start with provided name.
      dataHandler.addStart(latlng, name, checkControls);
      dataHandler.addEnd(latlng, name, checkControls);
      checkControls();
    }
    else{
      geocoder.defaultGeocoder.reverse(latlng, LSetup.map.options.crs.scale(19), function(results){
        var r = results[0];
        if(r){
          name = address.display(r);
          // Add start based on geocoding result.
          dataHandler.addStart(latlng, name, checkControls);
          dataHandler.addEnd(latlng, name, checkControls);
          checkControls();
        }
      });
    }
  }
  else{
    // Add regular job.
    if(name){
      // Add job with provided name.
      dataHandler.addJob(latlng, name, checkControls);
      checkControls();
    }
    else{
      geocoder.defaultGeocoder.reverse(latlng, LSetup.map.options.crs.scale(19), function(results){
        var r = results[0];
        if(r){
          name = address.display(r);
          // Add job based on geocoding result.
          dataHandler.addJob(latlng, name, checkControls);
          checkControls();
        }
      });
    }
  }
}

module.exports = {
  addPlace: addPlace
};
