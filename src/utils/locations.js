'use strict';

var data = require('../data');
var address = require('./address');
var geocoder = require('./geocoder');
var mapConfig = require('../config/leaflet');
var clearControl = require('../controls/clear');

var updateJobDescription = function (jobIndex, description){
  data.jobs[jobIndex]['description'] = description;
  data.jobsMarkers[jobIndex].bindPopup(description).openPopup();
}

var panelDisplay = function(name){
  var panelList = document.getElementById('panel-list');

  var nb_rows = panelList.rows.length;
  var row = panelList.insertRow(nb_rows);
  var idCell = row.insertCell(0);

  idCell.setAttribute('class', 'delete-location');
  idCell.title = "Click to delete";
  idCell.onclick = function(){
    console.log('TODO: implement removal');
  }
  var nameCell = row.insertCell(1);
  nameCell.title = "Click to center the map";
  nameCell.appendChild(document.createTextNode(name));
  nameCell.onclick = function(){
    console.log('TODO: implement marker pop-up');
  };
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
      var name = address.display(r);
      // Add description to job and marker.
      updateJobDescription(data.jobs.length - 1, name);
      // Add description in the right panel display.
      panelDisplay(name);
    }
  });

  if(!map.clearControl){
    map.addControl(clearControl);
  }
}

module.exports = {
  addPlace: addPlace
};
