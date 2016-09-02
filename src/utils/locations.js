'use strict';

var clearControl = require('../controls/clear');
var dataHandler = require('./data_handler');
var geocoder = require('./geocoder');
var address = require('./address');

var panelDisplay = function(map, name){
  var panelList = document.getElementById('panel-list');

  var nb_rows = panelList.rows.length;
  var row = panelList.insertRow(nb_rows);
  var idCell = row.insertCell(0);

  idCell.setAttribute('class', 'delete-location');
  idCell.title = "Click to delete";
  idCell.onclick = function(){
    dataHandler.removeJob(map, row.rowIndex);
    panelList.deleteRow(row.rowIndex);
    if(dataHandler.getSize() === 0){
      map.removeControl(clearControl);
    }
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
  if(!map.clearControl){
    map.addControl(clearControl);
  }

  dataHandler.addJob(map, latlng);

  geocoder.nominatim.reverse(latlng, map.options.crs.scale(19), function(results){
    var r = results[0];
    if(r){
      var name = address.display(r);
      // Add description to job and marker.
      dataHandler.updateJobDescription(dataHandler.getSize() - 1, name);
      // Add description in the right panel display.
      panelDisplay(map, name);
    }
  });
}

module.exports = {
  addPlace: addPlace
};
