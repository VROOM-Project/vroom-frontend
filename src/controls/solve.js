'use strict';

var solveControl = L.Control.extend({
  options: {
    position: 'topleft'
  },

  onAdd: function (map){
    // Add reference to map.
    map.solveControl = this;
    this._div = L.DomUtil.create('div', 'custom-control icon-control solve-control');
    this._div.title = 'Solve';
    this._div.onclick = function(e){
      L.DomEvent.stopPropagation(e);
      map.removeControl(solveControl);
      document.getElementById('wait-icon').setAttribute('class', 'wait-icon');
      map.fireEvent('solve');
    };
    return this._div;
  },

  onRemove: function (map){
    // Remove reference from map.
    delete map.solveControl;
  }
});

var solveControl = new solveControl();

module.exports = solveControl;
