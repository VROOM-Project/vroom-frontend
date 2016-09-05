'use strict';

var solutionHandler = require('../utils/solution_handler');

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

      solutionHandler.solve(map);
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
