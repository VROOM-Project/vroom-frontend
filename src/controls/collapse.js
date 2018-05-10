'use strict';

var collapseControl = L.Control.extend({
  options: {
    position: 'topright'
  },

  onAdd: function (map) {
    // Add reference to map.
    map.collapseControl = this;
    this._div = L.DomUtil.create('div', 'custom-control icon-control collapse-control collapse-control-right');
    this._div.title = 'Collapse';

    this._div.onclick = function(e) {
      L.DomEvent.stopPropagation(e);
      map.fireEvent('collapse');
    };
    return this._div;
  },

  onRemove: function (map) {
    // Remove reference from map.
    delete map.collapseControl;
  },

  toggle: function() {
    var right = 'collapse-control-right';
    var left = 'collapse-control-left';
    if (this._div.classList.contains(right)) {
      this._div.classList.remove(right);
      this._div.classList.add(left);
    } else {
      this._div.classList.remove(left);
      this._div.classList.add(right);
    }
  }
});

var collapseControl = new collapseControl();

module.exports = collapseControl;
