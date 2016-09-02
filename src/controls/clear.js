'use strict';

var dataHandler = require('../utils/data_handler');
var panelControl = require('./panel');

var clearControl = L.Control.extend({
  options: {
    position: 'topleft'
  },

  onAdd: function (map){
    // Add reference to map.
    map.clearControl = this;
    this._div = L.DomUtil.create('div', 'custom-control icon-control clear-control');
    this._div.title = 'Clear';

    this._div.onclick = function(e){
      L.DomEvent.stopPropagation(e);

      dataHandler.clearData(map);

      // Remove control.
      map.removeControl(clearControl);

      // Delete locations display in the right panel.
      panelControl.clearDisplay();
    };
    return this._div;
  },

  onRemove: function (map){
    // Remove reference from map.
    delete map.clearControl;
  }
});

var clearControl = new clearControl();

module.exports = clearControl;
