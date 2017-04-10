'use strict';

var snakeControl = L.Control.extend({
  options: {
    position: 'topleft'
  },

  onAdd: function (map){
    // Add reference to map.
    map.snakeControl = this;
    this._div = L.DomUtil.create('div', 'custom-control icon-control snake-control');
    this._div.title = 'Animate';
    this._div.onclick = function(e){
      L.DomEvent.stopPropagation(e);

      map.fireEvent('animate');
    };
    return this._div;
  },

  onRemove: function (map){
    // Remove reference from map.
    delete map.snakeControl;
  }
});

var snakeControl = new snakeControl();

module.exports = snakeControl;
