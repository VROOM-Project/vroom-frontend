'use strict';

var jobs = [];
var shipments = [];
var vehicles = [];

// Stored with type and task id as key, e.g. markers['job']['14'].
var markers = {
  'job': {},
  'pickup': {},
  'delivery': {}
};

// Stored with vehicle id + {_start,_end} as key
var vehiclesMarkers = {};

var maxTaskId = 0;
var maxVehicleId = 0;

module.exports = {
  jobs: jobs,
  shipments: shipments,
  maxTaskId: maxTaskId,
  maxVehicleId: maxVehicleId,
  vehicles: vehicles,
  markers: markers,
  vehiclesMarkers: vehiclesMarkers
};
