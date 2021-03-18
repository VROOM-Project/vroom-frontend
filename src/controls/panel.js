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
    jsonUploadEl.innerHTML = 'using a <a href="https://github.com/VROOM-Project/vroom/blob/master/docs/API.md">json-formatted</a> file.';

    var fileInput = document.createElement('input');
    fileInput.setAttribute('type', 'file');
    fileInput.setAttribute('id', 'user-file');

    jsonUploadEl.appendChild(fileInput);
    list.appendChild(jsonUploadEl);

    this._initDiv.appendChild(header);
    this._initDiv.appendChild(list);
    this._div.appendChild(this._initDiv);

    // Table for vehicles display.
    this._vehiclesDiv = document.createElement('div');
    this._vehiclesDiv.setAttribute('id', 'panel-vehicles');

    // Table for jobs display.
    this._jobTable = document.createElement('table');
    this._jobTable.setAttribute('id', 'panel-tasks');
    this._jobTable.setAttribute('class', 'panel-table');

    // Table for task-ordered solution display.
    this._solutionTable = document.createElement('table');
    this._solutionTable.setAttribute('id', 'panel-solution');
    this._solutionTable.setAttribute('class', 'panel-table');

    // Form for the Overpass query
    this._overpassDiv = document.createElement('div');
    this._overpassDiv.setAttribute('id', 'panel-overpass');
    this._overpassDiv.style.display = 'none';

    this.addOverpassForm(map);

    var tableDiv = document.createElement('div');

    tableDiv.appendChild(this._vehiclesDiv);
    tableDiv.appendChild(document.createElement('hr'));
    tableDiv.appendChild(this._overpassDiv);
    tableDiv.appendChild(this._jobTable);
    tableDiv.appendChild(this._solutionTable);
    this._div.appendChild(tableDiv);

    // Prevent events on this control to alter the underlying map.
    L.DomEvent.disableClickPropagation(this._div);
    L.DomEvent.on(this._div, 'mousewheel', L.DomEvent.stopPropagation);

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

  clearVehiclesDisplay: function() {
    // Delete vehicles div.
    this._vehiclesDiv.innerHTML = "";
  },

  clearDisplay: function() {
    this.clearJobDisplay();
    this.clearVehiclesDisplay();
    this.hideOverpassDisplay();
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

  hideOverpassDisplay: function() {
    this._overpassDiv.style.display = 'none';
  },

  showOverpassDisplay: function() {
    this._overpassDiv.style.display = 'block';
  },

  hideOverpassButton: function() {
    document.getElementById('button-request').style.display = 'none';
  },

  showOverpassButton: function() {
    document.getElementById('button-request').style.display = 'block';
  },

  addOverpassForm: function(map) {
    var overpassForm = document.createElement('table');
    overpassForm.setAttribute('id', 'table-overpass');

    // Title
    var overpassHeading = document.createElement('h2');
    overpassHeading.innerHTML = 'Add locations';
    overpassForm.appendChild(overpassHeading);
    var clickOption = document.createElement('div');
    clickOption.setAttribute('class', 'overpass-description');
    clickOption.innerHTML = '- by clicking on the map';
    overpassForm.appendChild(clickOption);

    // Table containing the Formular
    var tagTable = document.createElement('table');
    tagTable.setAttribute('class', 'overpass-table');

    // Subtitle
    var overpassSubtitle = document.createElement('text');
    var tagsText = 'tag';
    overpassSubtitle.innerHTML = '- using OpenStreetMap ' + tagsText.link('https://wiki.openstreetmap.org/wiki/Tags');
    overpassSubtitle.setAttribute('class', 'overpass-description');
    tagTable.appendChild(overpassSubtitle);

    var newLine = document.createElement ("br");
    tagTable.appendChild(newLine);

    // Formular cells
    var lineForm = document.createElement('form-inline');
    lineForm.setAttribute('id', 'tag-table');
    lineForm.setAttribute('class', 'overpass-tag-table');

    // Key cell
    var keyelement = document.createElement('input');
    keyelement.setAttribute('id', 'key-cell');
    keyelement.setAttribute('class', 'overpass-tag');
    keyelement.setAttribute('type', 'texte');
    keyelement.setAttribute('value', 'amenity');
    lineForm.appendChild(keyelement);

    // Value cell
    var valueelement = document.createElement('input');
    valueelement.setAttribute('id', 'value-cell');
    valueelement.setAttribute('class', 'overpass-value');
    valueelement.setAttribute('type', 'texte');
    valueelement.setAttribute('value', 'pharmacy');
    lineForm.appendChild(valueelement);

    tagTable.appendChild(lineForm);

    // Description
    var overpassDescription = document.createElement('text');
    var amenity_text = 'amenity'
    overpassDescription.innerHTML = 'More values for ' + amenity_text.link('https://wiki.openstreetmap.org/wiki/Key:amenity') + '.';
    tagTable.appendChild(overpassDescription);

    var newLine = document.createElement ("br");
    tagTable.appendChild(newLine);

    // Submit button
    var submitelement = document.createElement('input');
    submitelement.setAttribute('id', 'button-request');
    submitelement.setAttribute('class', 'overpass-button');
    submitelement.setAttribute('type', 'button');
    submitelement.setAttribute('value', 'Add');

    // Call overpass
    submitelement.onclick = function(e) {
      if (map.getZoom() < 9) {
        alert("The area is too large, please zoom in.");
        return;
      }
      L.DomEvent.stopPropagation(e);
      document.getElementById('wait-icon').setAttribute('class', 'wait-icon');
      panelControl.hideOverpassButton();
      map.fireEvent('overpass');
    };

    tagTable.appendChild(submitelement);
    overpassForm.appendChild(tagTable);
    this._overpassDiv.appendChild(overpassForm);
  },

  toggle: function() {
    if (this._div.style.visibility == 'hidden') {
      this._div.style.visibility = 'visible';
    } else {
      this._div.style.visibility = 'hidden';
    }
  },

  getWidth: function() {
    var width = this._div.offsetWidth;
    if (this._div.style.visibility == 'hidden') {
      width = 0;
    }
    return width;
  }
});

var panelControl = new panelControl();

module.exports = panelControl;
