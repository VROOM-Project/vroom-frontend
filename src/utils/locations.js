'use strict';

var LSetup = require('../config/leaflet_setup');
var dataHandler = require('./data_handler');
var geocoder = require('./geocoder');
var address = require('./address');
var panelControl = require('../controls/panel');

// Add locations.
var addPlace = function(latlng, name) {
  if (LSetup.maxBounds && !LSetup.maxBounds.contains(latlng)) {
    alert('Sorry, unsupported location. :-(');
    return;
  }
  panelControl.hideInitDiv();

  if (dataHandler.isFirstPlace()) {
    // Add vehicle start/end.
    dataHandler.firstPlaceSet();

    var addVechicleWithName = function(name) {
      var v = {
        'id': 0,
        'start': [latlng.lng,latlng.lat],
        'startDescription': name,
        'end': [latlng.lng,latlng.lat],
        'endDescription': name
      };
      dataHandler.addVehicle(v);
      dataHandler.checkControls();
    }

    if (name) {
      // Add vehicle with provided name for start and end.
      addVechicleWithName(name)
    } else {
      geocoder.defaultGeocoder.reverse(latlng, LSetup.map.options.crs.scale(19), function(results) {
        var r = results[0];
        if (r) {
          // Add vehicle based on geocoding result for start and end.
          addVechicleWithName(address.display(r));
        }
      });
    }
  } else {
    // Add regular job.
    var addJobWithName = function(name) {
      var j = {
        'id': dataHandler.getJobsSize(),
        'description': name,
        'location': [latlng.lng,latlng.lat]
      };

      dataHandler.addJob(j);
      dataHandler.checkControls();
    }

    if (name) {
      // Add job with provided name.
      addJobWithName(name);
    } else {
      geocoder.defaultGeocoder.reverse(latlng, LSetup.map.options.crs.scale(19), function(results) {
        var r = results[0];
        if (r) {
          // Add job based on geocoding result.
          addJobWithName(address.display(r));
        }
      });
    }
  }
}

module.exports = {
  addPlace: addPlace
};
