'use strict';

var clearControl = require('../controls/clear');
var dataHandler = require('./data_handler');
var geocoder = require('./geocoder');
var address = require('./address');

var startDisplay = function(map, name){
  var panelList = document.getElementById('panel-vehicle');

  panelList.deleteRow(0);
  var row = panelList.insertRow(0);
  var idCell = row.insertCell(0);

  var removeCallback = function(){
    dataHandler.removeStart(map);
    // Reset start row.
    panelList.deleteRow(0);
    panelList.insertRow(0);
    if(dataHandler.getSize() === 0
       && !dataHandler.getStart()
       && !dataHandler.getEnd()){
      map.removeControl(clearControl);
    }
  }
  idCell.setAttribute('class', 'delete-location');
  idCell.title = "Click to delete";
  idCell.onclick = removeCallback;
  var nameCell = row.insertCell(1);
  nameCell.title = "Click to center the map";
  nameCell.setAttribute("class", "vehicle-start");
  nameCell.appendChild(document.createTextNode(name));
  nameCell.onclick = function(){
    dataHandler.showStart(map, true);
  };
  // Add description.
  dataHandler.updateStartDescription(name, removeCallback);
}

var endDisplay = function(map, name){
  var panelList = document.getElementById('panel-vehicle');

  panelList.deleteRow(1);
  var row = panelList.insertRow(1);
  var idCell = row.insertCell(0);

  var removeCallback = function(){
    dataHandler.removeEnd(map);
    // Reset end row.
    panelList.deleteRow(1);
    panelList.insertRow(1);
    if(dataHandler.getSize() === 0
       && !dataHandler.getEnd()
       && !dataHandler.getEnd()){
      map.removeControl(clearControl);
    }
  }
  idCell.setAttribute('class', 'delete-location');
  idCell.title = "Click to delete";
  idCell.onclick = removeCallback;
  var nameCell = row.insertCell(1);
  nameCell.title = "Click to center the map";
  nameCell.setAttribute("class", "vehicle-end");
  nameCell.appendChild(document.createTextNode(name));
  nameCell.onclick = function(){
    dataHandler.showEnd(map, true);
  };
  // Add description.
  dataHandler.updateEndDescription(name, removeCallback);
}

var jobDisplay = function(map, name){
  var panelList = document.getElementById('panel-jobs');

  var nb_rows = panelList.rows.length;
  var row = panelList.insertRow(nb_rows);
  var idCell = row.insertCell(0);

  var removeCallback = function(){
    dataHandler.removeJob(map, row.rowIndex);
    panelList.deleteRow(row.rowIndex);
    if(dataHandler.getSize() === 0
       && !dataHandler.getStart()
       && !dataHandler.getEnd()){
      map.removeControl(clearControl);
    }
  }
  idCell.setAttribute('class', 'delete-location');
  idCell.title = "Click to delete";
  idCell.onclick = removeCallback;
  var nameCell = row.insertCell(1);
  nameCell.title = "Click to center the map";
  nameCell.appendChild(document.createTextNode(name));
  nameCell.onclick = function(){
    dataHandler.showMarker(map, row.rowIndex, true);
  };
  // Add description to job and marker.
  dataHandler.updateJobDescription(dataHandler.getSize() - 1,
                                   name,
                                   removeCallback);
}

// Add locations.
var addPlace = function(map, latlng){
  if(!map.clearControl){
    map.addControl(clearControl);
  }

  if(!dataHandler.getStart() && !dataHandler.getEnd()){
    // Add first location, defaults to vehicle start and end.
    dataHandler.addFirst(map, latlng);

    geocoder.nominatim.reverse(latlng, map.options.crs.scale(19), function(results){
      var r = results[0];
      if(r){
        var name = address.display(r);
        // Add description in the right panel display.
        startDisplay(map, name);
        endDisplay(map, name);
      }
    });
  }
  else{
    // Add regular job.
    dataHandler.addJob(map, latlng);

    geocoder.nominatim.reverse(latlng, map.options.crs.scale(19), function(results){
      var r = results[0];
      if(r){
        var name = address.display(r);
        // Add description in the right panel display and create job
        // marker.
        jobDisplay(map, name);
      }
    });
  }
}

module.exports = {
  addPlace: addPlace
};
