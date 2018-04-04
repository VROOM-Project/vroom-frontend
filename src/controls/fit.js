'use strict';

var L = require('leaflet');

var fitControl = L.Control.extend({
  options: {
    position: 'topleft'
  },

  onAdd: function (map) {
    // Add reference to map.
    map.fitControl = this;
    this._div = L.DomUtil.create('div', 'custom-control icon-control fit-control');
    this._div.title = 'Show all places';
    this._div.onclick = function(e) {
      L.DomEvent.stopPropagation(e);
      map.fireEvent('fit');
    };

    return this._div;
  },

  onRemove: function (map) {
    // Remove reference from map.
    delete map.fitControl;
  }
});

var fitControl = new fitControl();

module.exports = fitControl;
