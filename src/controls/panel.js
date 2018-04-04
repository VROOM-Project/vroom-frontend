'use strict';

var L = require('leaflet');

var panelControl = L.Control.extend({
  options: {
    position: 'topright'
  },

  onAdd: function (map) {
    // Add reference to map.
    map.panelControl = this;

    // Main panel div.
    this._div = L.DomUtil.create('div', 'panel-control');

    // Header for panel control.
    var headerDiv = document.createElement('div');
    headerDiv.setAttribute('class', 'panel-header');
    headerDiv.innerHTML = '<a href="http://vroom-project.org"><img src="../../images/vroom.svg" alt="Vroom" /></a>';
    this._div.appendChild(headerDiv);

    // Wait icon displayed while solving.
    this._waitDisplayDiv = document.createElement('div');
    this._waitDisplayDiv.setAttribute('class', 'wait-display');
    var waitIcon = document.createElement('i');
    waitIcon.setAttribute('id', 'wait-icon');
    this._waitDisplayDiv.appendChild(waitIcon);
    this._div.appendChild(this._waitDisplayDiv);

    // Initial displayed message.
    this._initDiv = document.createElement('div');
    this._initDiv.setAttribute('id', 'init-display');

    var header = document.createElement('p');
    header.innerHTML = '<b>Add locations either by:</b>'

    var list = document.createElement('ul');
    var clickEl = document.createElement('li');
    clickEl.innerHTML = 'clicking on the map;';
    list.appendChild(clickEl);
    var uploadEl = document.createElement('li');
    uploadEl.innerHTML = 'using a file with one address (or Lat,Lng coord) on each line.';
    list.appendChild(uploadEl);

    var jsonUploadEl = document.createElement('li');
    jsonUploadEl.innerHTML = 'using a <a href="https://github.com/VROOM-Project/vroom/blob/v1.1.0/docs/API.md">json-formatted</a> file.';

    var fileInput = document.createElement('input');
    fileInput.setAttribute('type', 'file');
    fileInput.setAttribute('id', 'user-file');

    jsonUploadEl.appendChild(fileInput);
    list.appendChild(jsonUploadEl);

    this._initDiv.appendChild(header);
    this._initDiv.appendChild(list);
    this._div.appendChild(this._initDiv);

    // Table for start/end display.
    this._vehicleTable = document.createElement('table');
    this._vehicleTable.setAttribute('id', 'panel-vehicle');
    this._vehicleTable.insertRow(0);
    this._vehicleTable.insertRow(1);

    // Table for jobs display.
    this._jobTable = document.createElement('table');
    this._jobTable.setAttribute('id', 'panel-jobs');

    // Table for job-ordered solution display.
    this._solutionTable = document.createElement('table');
    this._solutionTable.setAttribute('id', 'panel-solution');

    var tableDiv = document.createElement('div');
    tableDiv.setAttribute('class', 'panel-table');

    tableDiv.appendChild(this._vehicleTable);
    tableDiv.appendChild(document.createElement('hr'));
    tableDiv.appendChild(this._jobTable);
    tableDiv.appendChild(this._solutionTable);
    this._div.appendChild(tableDiv);

    // Prevent events on this control to alter the underlying map.
    if (!L.Browser.touch) {
      L.DomEvent.disableClickPropagation(this._div);
      L.DomEvent.on(this._div, 'mousewheel', L.DomEvent.stopPropagation);
    } else {
      L.DomEvent.on(this._div, 'click', L.DomEvent.stopPropagation);
    }

    return this._div;
  },

  onRemove: function(map) {
    // Remove reference from map.
    delete map.panelControl;
  },

  clearJobDisplay: function() {
    // Delete jobs display.
    for (var i = this._jobTable.rows.length; i > 0; i--) {
      this._jobTable.deleteRow(i -1);
    }
  },

  clearStartEndDisplay: function() {
    // Reset vehicle start/end display.
    for (var i = this._vehicleTable.rows.length; i > 0; i--) {
      this._vehicleTable.deleteRow(i -1);
    }
    this._vehicleTable.insertRow(0);
    this._vehicleTable.insertRow(1);
  },

  clearDisplay: function() {
    this.clearJobDisplay();
    this.clearStartEndDisplay();
    this.showInitDiv();
  },

  clearSolutionDisplay: function() {
    for (var i = this._solutionTable.rows.length; i > 0; i--) {
      this._solutionTable.deleteRow(i -1);
    }
  },

  hideJobDisplay: function() {
    this._jobTable.style.display = 'none';
  },

  showJobDisplay: function() {
    this._jobTable.style.display = 'block';
  },

  hideInitDiv: function() {
    this._initDiv.style.display = 'none';
  },

  showInitDiv: function() {
    this._initDiv.style.display = 'block';
  },

  getWidth: function() {
    return this._div.offsetWidth;
  }
});

var panelControl = new panelControl();

module.exports = panelControl;
