'use strict';

var data = require('../data');
var address = require('./address');
var geocoder = require('./geocoder');
var mapConfig = require('../config/leaflet');

var updateJobDescription = function (jobIndex, description){
  data.jobs[jobIndex]['description'] = description;
  data.jobsMarkers[jobIndex].bindPopup(description).openPopup();
}

// Add locations.
var addPlace = function(map, latlng){
  data.jobs.push({'location': [latlng.lng,latlng.lat]});
  data.jobsMarkers.push(L.marker(latlng)
                        .addTo(map)
                        .setIcon(mapConfig.jobIcon));

  geocoder.nominatim.reverse(latlng, map.options.crs.scale(19), function(results){
    var r = results[0];
    if(r){
      updateJobDescription(data.jobs.length - 1, address.display(r));
    }
  });

}

module.exports = {
  addPlace: addPlace
};
