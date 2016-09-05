'use strict';

var L = require('leaflet');

var panelControl = L.Control.extend({
  options: {
    position: 'topright'
  },

  onAdd: function (map){
    // Add reference to map.
    map.panelControl = this;

    // Main panel div.
    this._div = L.DomUtil.create('div', 'panel-control');

    // Header for panel control.
    var headerDiv = document.createElement('div');
    headerDiv.setAttribute('class', 'panel-header');
    headerDiv.innerHTML = '<a href="http://vroom-project.org">VROOM</a>';
    this._div.appendChild(headerDiv);

    // Table start/end display.
    this._vehicleTable = document.createElement('table');
    this._vehicleTable.setAttribute('id', 'panel-vehicle');
    this._vehicleTable.insertRow(0);
    this._vehicleTable.insertRow(1);

    // Table jobs display.
    this._jobTable = document.createElement('table');
    this._jobTable.setAttribute('id', 'panel-jobs');

    var tableDiv = document.createElement('div');
    tableDiv.setAttribute('class', 'panel-table');

    tableDiv.appendChild(this._vehicleTable);
    tableDiv.appendChild(document.createElement('hr'));
    tableDiv.appendChild(this._jobTable);
    this._div.appendChild(tableDiv);

    // Prevent events on this control to alter the underlying map.
    if (!L.Browser.touch) {
      L.DomEvent.disableClickPropagation(this._div);
      L.DomEvent.on(this._div, 'mousewheel', L.DomEvent.stopPropagation);
    }
    else {
      L.DomEvent.on(this._div, 'click', L.DomEvent.stopPropagation);
    }

    return this._div;
  },

  onRemove: function (map){
    // Remove reference from map.
    delete map.panelControl;
  },

  clearDisplay: function(map){
    // Delete locations display.
    for(var i = this._jobTable.rows.length; i > 0; i--){
      this._jobTable.deleteRow(i -1);
    }
  },

  getWidth: function(){
    return this._div.offsetWidth;
  }
});

var panelControl = new panelControl();

module.exports = panelControl;
