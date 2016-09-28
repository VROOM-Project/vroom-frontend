'use strict';

var LSetup = require('../config/leaflet_setup');
var dataHandler = require('./data_handler');
var geocoder = require('./geocoder');
var address = require('./address');
var panelControl = require('../controls/panel');

// Add locations.
var addPlace = function(latlng, name){
  if(LSetup.maxBounds && !LSetup.maxBounds.contains(latlng)){
    alert('Sorry, unsupported location. :-(');
    return;
  }
  panelControl.hideInitDiv();

  if(dataHandler.isFirstPlace()){
    // Add vehicle start/end.
    dataHandler.firstPlaceSet();

    if(name){
      // Add start with provided name.
      dataHandler.addStart(latlng, name);
      dataHandler.addEnd(latlng, name);
      dataHandler.checkControls();
    }
    else{
      geocoder.defaultGeocoder.reverse(latlng, LSetup.map.options.crs.scale(19), function(results){
        var r = results[0];
        if(r){
          name = address.display(r);
          // Add start based on geocoding result.
          dataHandler.addStart(latlng, name);
          dataHandler.addEnd(latlng, name);
          dataHandler.checkControls();
        }
      });
    }
  }
  else{
    // Add regular job.
    if(name){
      // Add job with provided name.
      dataHandler.addJob(latlng, name);
      dataHandler.checkControls();
    }
    else{
      geocoder.defaultGeocoder.reverse(latlng, LSetup.map.options.crs.scale(19), function(results){
        var r = results[0];
        if(r){
          name = address.display(r);
          // Add job based on geocoding result.
          dataHandler.addJob(latlng, name);
          dataHandler.checkControls();
        }
      });
    }
  }
}

module.exports = {
  addPlace: addPlace
};
