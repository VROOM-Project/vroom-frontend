'use strict';

var jobs = [];
var shipments = [];
var vehicles = [];

// Stored with task id as key.
var jobsMarkers = {};
var pickupsMarkers = {};
var deliveriesMarkers = {};

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
  jobsMarkers: jobsMarkers,
  vehiclesMarkers: vehiclesMarkers
};
