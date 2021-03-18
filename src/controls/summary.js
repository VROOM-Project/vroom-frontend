'use strict';

var time = require('../utils/timing');

var summaryControl = L.Control.extend({
  options: {
    position: 'bottomleft'
  },

  onAdd: function (map) {
    // Add reference to map.
    map.summaryControl = this;
    this._div = L.DomUtil.create('div', 'custom-control summary-control');
    return this._div;
  },

  onRemove: function (map) {
    // Remove reference from map.
    delete map.summaryControl;
  },

  update: function(solution) {
    this._div.innerHTML = '';

    var displayDuration = document.createElement('p');
    displayDuration.innerHTML = '<b>Trip duration:</b> '
      + time.format(solution['summary']['duration']);
    this._div.appendChild(displayDuration);

    var displayDistance = document.createElement('p');
    var distance = (solution['summary']['distance'] / 1000).toFixed(1);
    displayDistance.innerHTML = '<b>Trip distance:</b> '
      + distance.toString() + ' km';
    this._div.appendChild(displayDistance);

    // Computing time stuff.
    var CTLoading = solution['summary']['computing_times']['loading'];
    var CTSolving = solution['summary']['computing_times']['solving'];
    var CTRouting = solution['summary']['computing_times']['routing'];

    var CTDisplay = document.createElement('p');
    CTDisplay.title = 'Loading: ' + CTLoading + ' ms / Solving: '
      + CTSolving + ' ms/ Routing: ' + CTRouting + ' ms';

    var ct = CTLoading + CTSolving + CTRouting;
    CTDisplay.innerHTML = '<b>Computing time: </b>' + (ct / 1000) + ' s';
    this._div.appendChild(CTDisplay);
  }
});

var summaryControl = new summaryControl();

module.exports = summaryControl;
