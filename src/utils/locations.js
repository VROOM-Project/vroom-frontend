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

    var addVechicleWithName = function(name, center) {
      var v = {
        'id': dataHandler.getNextJobId(),
        'start': [latlng.lng,latlng.lat],
        'startDescription': name,
        'end': [latlng.lng,latlng.lat],
        'endDescription': name
      };
      dataHandler.addVehicle(v);
      dataHandler.checkControls();
      if (center) {
        dataHandler.showStart(v, center);
      }
    }

    if (name) {
      // Add vehicle with provided name for start and end.
      addVechicleWithName(name, true)
    } else {
      geocoder.defaultGeocoder.reverse(latlng, LSetup.map.options.crs.scale(19), function(results) {
        var r = results[0];
        if (r) {
          // Add vehicle based on geocoding result for start and end.
          addVechicleWithName(address.display(r), false);
        }
      });
    }
    panelControl.showOverpassDisplay();
  } else {
    // Add regular job.
    var addJobWithName = function(name, center) {
      var j = {
        'id': dataHandler.getNextJobId(),
        'description': name,
        'location': [latlng.lng,latlng.lat]
      };

      dataHandler.addJob(j);
      dataHandler.checkControls();
      if (center) {
        dataHandler.centerJob(j);
      }
    }

    if (name) {
      // Add job with provided name.
      addJobWithName(name, true);
    } else {
      geocoder.defaultGeocoder.reverse(latlng, LSetup.map.options.crs.scale(19), function(results) {
        var r = results[0];
        if (r) {
          // Add job based on geocoding result.
          addJobWithName(address.display(r), false);
        }
      });
    }
  }
}

module.exports = {
  addPlace: addPlace
};
