'use strict';

var clearControl = require('../controls/clear');
var dataHandler = require('./data_handler');
var geocoder = require('./geocoder');
var address = require('./address');
var solveControl = require('../controls/solve');

var addSolveControl = function(map){
  if(!map.solveControl
     && (dataHandler.getStart() || dataHandler.getEnd())
     && (dataHandler.getJobsSize() > 0)){
    solveControl.addTo(map);
  }
}

var setStart = function(map, latlng, name){
  // Add start to dataset.
  dataHandler.addStart(map, latlng);

  var panelList = document.getElementById('panel-vehicle');

  panelList.deleteRow(0);
  var row = panelList.insertRow(0);
  var idCell = row.insertCell(0);

  var remove = function(){
    if(dataHandler.removeStart(map)){
      // Reset start row when removing is ok.
      panelList.deleteRow(0);
      panelList.insertRow(0);
      if(dataHandler.getJobsSize() === 0
         && !dataHandler.getStart()
         && !dataHandler.getEnd()){
        map.removeControl(clearControl);
      }
      addSolveControl(map);
    }
  }
  idCell.setAttribute('class', 'delete-location');
  idCell.title = "Click to delete";
  idCell.onclick = remove;
  var nameCell = row.insertCell(1);
  nameCell.title = "Click to center the map";
  nameCell.setAttribute("class", "vehicle-start");
  nameCell.appendChild(document.createTextNode(name));
  nameCell.onclick = function(){
    dataHandler.showStart(map, true);
  };
  // Add description.
  dataHandler.updateStartDescription(name, remove);
}

var setEnd = function(map, latlng, name){
  // Add end to dataset.
  dataHandler.addEnd(map, latlng);

  var panelList = document.getElementById('panel-vehicle');

  panelList.deleteRow(1);
  var row = panelList.insertRow(1);
  var idCell = row.insertCell(0);

  var remove = function(){
    if(dataHandler.removeEnd(map)){
      // Reset end row when removing is ok.
      panelList.deleteRow(1);
      panelList.insertRow(1);
      if(dataHandler.getJobsSize() === 0
         && !dataHandler.getEnd()
         && !dataHandler.getEnd()){
        map.removeControl(clearControl);
      }
      addSolveControl(map);
    }
  }
  idCell.setAttribute('class', 'delete-location');
  idCell.title = "Click to delete";
  idCell.onclick = remove;
  var nameCell = row.insertCell(1);
  nameCell.title = "Click to center the map";
  nameCell.setAttribute("class", "vehicle-end");
  nameCell.appendChild(document.createTextNode(name));
  nameCell.onclick = function(){
    dataHandler.showEnd(map, true);
  };
  // Add description.
  dataHandler.updateEndDescription(name, remove);
}

var jobDisplay = function(map, latlng, name){
  // Add job in dataset.
  dataHandler.addJob(map, latlng);

  var panelList = document.getElementById('panel-jobs');

  var nb_rows = panelList.rows.length;
  var row = panelList.insertRow(nb_rows);
  var idCell = row.insertCell(0);

  var remove = function(){
    dataHandler.removeJob(map, row.rowIndex);
    panelList.deleteRow(row.rowIndex);
    if(dataHandler.getJobsSize() === 0
       && !dataHandler.getStart()
       && !dataHandler.getEnd()){
      map.removeControl(clearControl);
    }
    addSolveControl(map);
  }
  idCell.setAttribute('class', 'delete-location');
  idCell.title = "Click to delete";
  idCell.onclick = remove;
  var nameCell = row.insertCell(1);
  nameCell.title = "Click to center the map";
  nameCell.appendChild(document.createTextNode(name));
  nameCell.onclick = function(){
    dataHandler.showMarker(map, row.rowIndex, true);
  };
  // Callbacks to replace current start or end by this job.
  var setAsStart = function(){
    setStart(map, latlng, name);
    dataHandler.removeJob(map, row.rowIndex);
    panelList.deleteRow(row.rowIndex);
    addSolveControl(map);
  }
  var setAsEnd = function(){
    setEnd(map, latlng, name);
    dataHandler.removeJob(map, row.rowIndex);
    panelList.deleteRow(row.rowIndex);
    addSolveControl(map);
  }
  // Add description to job and marker.
  dataHandler.updateJobDescription(dataHandler.getJobsSize() - 1,
                                   name,
                                   remove,
                                   setAsStart,
                                   setAsEnd);
}

// Add locations.
var addPlace = function(map, latlng){
  if(!map.clearControl){
    map.addControl(clearControl);
  }

  if(!dataHandler.getStart() && !dataHandler.getEnd()){
    geocoder.nominatim.reverse(latlng, map.options.crs.scale(19), function(results){
      var r = results[0];
      if(r){
        var name = address.display(r);
        // Add description in the right panel display.
        setStart(map, latlng, name);
        setEnd(map, latlng, name);
        addSolveControl(map);
      }
    });
  }
  else{
    geocoder.nominatim.reverse(latlng, map.options.crs.scale(19), function(results){
      var r = results[0];
      if(r){
        var name = address.display(r);
        // Add description in the right panel display and create job
        // marker.
        jobDisplay(map, latlng, name);
        addSolveControl(map);
      }
    });
  }

}

module.exports = {
  addPlace: addPlace
};
