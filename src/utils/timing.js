'use strict';

var format = function (seconds) {
  var result = '';
  var minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    result = minutes + ' m';
  } else {
    var hours = Math.floor(minutes / 60);
    var minutes_mod = minutes % 60;
    if (minutes_mod > 0) {
      var padding = (minutes_mod < 10) ? '0': '';
      result = ' ' + padding + minutes_mod + result;
    }
    if (hours > 0) {
      result = (hours % 24) + ' h' + result;
    }
    var days = Math.floor(hours / 24);
    if (days > 0) {
      result = (days % 7) + ' d ' + result;
    }
    var weeks = Math.floor(days / 7);
    if (weeks > 0) {
      result = weeks + ' w ' + result;
    }
  }
  return result;
}

module.exports = {
  format: format
};
