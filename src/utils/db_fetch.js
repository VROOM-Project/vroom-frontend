// functions for fetching data from database
var config = require('../config/api');


function fetchOpenOrders() {
    // Open orders are not necessarily ready to ship.
    // These are only be displayed on the map.
    

}

function fetchShipments() {
    // Shipments are ready to ship.
    // These are used to calculate a route.

}

module.exports = {
    fetchOpenOrders: fetchOpenOrders,
    fetchShipments: fetchShipments
  };
  