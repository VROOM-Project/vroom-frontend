'use strict';

var geocoder = require('./geocoder');
var address = require('./address');
var locationHandler = require('./locations');

var reader = new FileReader();

reader.onerror = function(event){
  alert("File could not be read! Code " + event.target.error.code);
};

reader.onload = function(event){
  var lines = event.target.result.split("\n");

  // Strip blank lines from file.
  while(lines.indexOf("") > -1){
    lines.splice(lines.indexOf(""), 1);
  }

  // Used to report after parsing the whole file.
  var context = {
    locNumber: 0,
    targetLocNumber: lines.length,
    totalLocNumber: lines.length,
    unfoundLocs: []
  };

  for(var i = 0; i < context.targetLocNumber; ++i){
    _batchGeocodeAdd(lines[i], context);
  }
};

var _batchGeocodeAdd = function(query, context){
  geocoder.defaultGeocoder.geocode(query, function(results){
    context.locNumber += 1;
    var r = results[0];
    if(r){
      locationHandler.addPlace(r.center,
                               address.display(r));
    }
    else{
      context.unfoundLocs.push(query);
    }
    if(context.locNumber === context.targetLocNumber){
      // Last location have been tried.
      var msg = '';
      if(context.targetLocNumber < context.totalLocNumber){
        msg += 'Warning: only the first '
          + context.targetLocNumber
          + ' locations where used.\n';
      }
      if(context.unfoundLocs.length > 0){
        msg += 'Unfound location(s):\n';
        for(var i = 0; i < context.unfoundLocs.length; ++i){
          msg += '- ' + context.unfoundLocs[i] + '\n';
        }
      }
      if(msg.length > 0){
        alert(msg);
      }
    }
  }, context);
};

var setFile = function(){
  var fileInput = document.getElementById('user-file');
  fileInput.addEventListener("change", function(event){
    reader.readAsText(fileInput.files[0]);
  }, false);
}


module.exports = {
  setFile: setFile
};

