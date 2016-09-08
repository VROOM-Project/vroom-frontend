'use strict';

var LSetup = require('../config/leaflet_setup');
var clearControl = require('../controls/clear');
var dataHandler = require('./data_handler');
var geocoder = require('./geocoder');
var address = require('./address');
var panelControl = require('../controls/panel');

// Add locations.
var addPlace = function(latlng, name){
  panelControl.hideInitDiv();

  if(!LSetup.map.clearControl){
    LSetup.map.addControl(clearControl);
  }
  if(dataHandler.isFirstPlace()){
    // Add vehicle start/end.
    dataHandler.firstPlaceSet();

    if(name){
      // Add start with provided name.
      dataHandler.addStart(latlng, name);
      dataHandler.addEnd(latlng, name);
    }
    else{
      geocoder.defaultGeocoder.reverse(latlng, LSetup.map.options.crs.scale(19), function(results){
        var r = results[0];
        if(r){
          name = address.display(r);
          // Add start based on geocoding result.
          dataHandler.addStart(latlng, name);
          dataHandler.addEnd(latlng, name);
        }
      });
    }
  }
  else{
    // Add regular job.
    if(name){
      // Add job with provided name.
      dataHandler.addJob(latlng, name);
    }
    else{
      geocoder.defaultGeocoder.reverse(latlng, LSetup.map.options.crs.scale(19), function(results){
        var r = results[0];
        if(r){
          name = address.display(r);
          // Add job based on geocoding result.
          dataHandler.addJob(latlng, name);
        }
      });
    }
  }
}

module.exports = {
  addPlace: addPlace
};
