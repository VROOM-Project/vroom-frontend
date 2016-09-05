'use strict';

var data = require('../data');
var mapConfig = require('../config/leaflet');

var getSize = function(){
  return data.jobs.length;
}

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

var updateJobDescription = function (jobIndex, description){
  data.jobs[jobIndex]['description'] = description;
  data.jobsMarkers[jobIndex].bindPopup(description).openPopup();
}

var addJob = function(map, latlng){
  data.jobs.push({'location': [latlng.lng,latlng.lat]});
  data.jobsMarkers.push(L.marker(latlng)
                        .addTo(map)
                        .setIcon(mapConfig.jobIcon));
}

var removeJob = function(map, jobIndex){
  map.removeLayer(data.jobsMarkers[jobIndex]);
  data.jobs.splice(jobIndex, 1);
  data.jobsMarkers.splice(jobIndex, 1);

}

var showMarker = function(map, markerIndex, center){
  data.jobsMarkers[markerIndex].openPopup();
  if(center){
    map.panTo(data.jobsMarkers[markerIndex].getLatLng());
  }
}

module.exports = {
  getSize: getSize,
  clearData: clearData,
  addJob: addJob,
  updateJobDescription: updateJobDescription,
  removeJob: removeJob,
  showMarker: showMarker
};
