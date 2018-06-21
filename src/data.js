'use strict';

var jobs = [];
var vehicles = [];

// Stored with job id as key.
var jobsMarkers = {};

// Stored with vehicle id + {_start,_end} as key
var vehiclesMarkers = {};

module.exports = {
  jobs: jobs,
  vehicles: vehicles,
  jobsMarkers: jobsMarkers,
  vehiclesMarkers: vehiclesMarkers
};
