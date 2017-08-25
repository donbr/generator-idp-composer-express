'use strict';


const unirest = require('unirest');

// this module has the model functions relating to queries
// an example has been provided

// return data from query Q1
exports.Q1 = function (param1, apiPath, callback) {
  unirest.get(apiPath + '/api/queries/Q1?param1=' + param1).end(function (response) {
    let ResultList = response.body;
    // do any enrichment here
    callback(ResultList);
  });
}
