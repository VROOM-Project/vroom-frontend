'use strict';

// Use the result of a reverse geocoding query to compute a simplified
// string describing the address.
var display = function(reverseGeo) {
  var address = reverseGeo.properties.address
  var name = '';
  if (address.house_number) {
    name += address.house_number;
  }
  if (address.road) {
    if (name.length !== 0) {
      name += ', ';
    }
    name += address.road;
  }
  if (!address.road && address.pedestrian) {
    if (name.length !== 0) {
      name += ', '
    }
    name += address.pedestrian;
  }
  if (!address.road && !address.pedestrian && address.suburb) {
    if (name.length !== 0) {
      name += ', '
    }
    name += address.suburb;
  }
  if (address.village) {
    if (name.length != 0) {
      name += ', ';
    }
    name += address.village;
  }
  if (address.town) {
    if (name.length != 0) {
      name += ', ';
    }
    name += address.town;
  }
  if (address.city) {
    if (name.length != 0) {
      name += ', ';
    }
    name +=  address.city;
  }
  if (name.length === 0 && address.country) {
    name = address.country;
  }
  return name;
}

module.exports = {
  display: display
};
