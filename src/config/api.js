'use strict';

module.exports = {
  tileLayer: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
  description: '<a href="https://www.ens2m.fr/">ens2m</a>',
  // Toogle the following to use a local vroom-server instance.
  host: 'http://solver.vroom-project.org',
  // host: 'http://localhost',
  // port: '3000',
  maxJobNumber: 50
};
