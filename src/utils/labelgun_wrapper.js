'use strict';

var LSetup = require('../config/leaflet_setup');
var labelgun = require('labelgun');

var hideLabel = function(label){
  label.labelObject.style.opacity = 0;
};

var showLabel = function(label){
  label.labelObject.style.opacity = LSetup.labelOpacity;
};

var labelEngine = new labelgun.default(hideLabel, showLabel);

var addLabel = function(layer, rank){
  var label = layer.getTooltip()._source._tooltip._container;
  if (label){
    var rect = label.getBoundingClientRect();

    var bottomLeft = LSetup.map.containerPointToLatLng([rect.left, rect.bottom]);
    var topRight = LSetup.map.containerPointToLatLng([rect.right, rect.top]);

    var bb = {
      bottomLeft: [bottomLeft.lng, bottomLeft.lat],
      topRight: [topRight.lng, topRight.lat]
    };

    labelEngine.ingestLabel(bb,
                            rank,
                            1, // Same priority for all.
                            label,
                            rank.toString(),
                            false);
  }
}

module.exports = {
  addLabel: addLabel,
  destroy: function(){
    labelEngine.destroy();
  },
  update: function(){
    labelEngine.update()
  }
}
