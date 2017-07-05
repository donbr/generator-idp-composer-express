'use strict';


const unirest = require('unirest');

// this module has the model functions relating to <%= currentAsset.name %>

// return all instances of <%= currentAsset.name %> as an array
exports.getAll = function (apiPath, callback) {
  unirest.get(apiPath + '/api/<%= currentAsset.name %>').end(function (response) {
    let <%= currentAsset.name %>List = response.body;
    // do any enrichment here
    callback(<%= currentAsset.name %>List);
  });
}

// return the instance of <%= currentAsset.name %> identified by 'id'
exports.getById = function (id, apiPath, callback) {
  unirest.get(apiPath + '/api/<%= currentAsset.name %>/' + id).end(function (response) {
    let <%= currentAsset.name %> = response.body;
    // do any enrichment here
    callback(<%= currentAsset.name %>);
  });
}

// create a new <%= currentAsset.name %> from a prototype
// NB a prototype is a <%= currentAsset.name %> but without the class & id fields
// rewrite the random ID generator with your own method if required
exports.create = function (proto<%= currentAsset.name %>, apiPath, callback) {
  const <%= currentAsset.name %> = {
    "$class": "<%= namespace %>.<%= currentAsset.name %>",
    "<%= assetIdentifier %>": "ID:" + Math.trunc(Math.random() * 10000),
    <% for(var x=0;x<currentAsset.properties.length;x++) { %>
      "<%= currentAsset.properties[x].name %>": <%= currentAsset.properties[x].name %>","
    <% } %>
  };
  unirest.post(apiPath + '/api/<%= currentAsset.name %>/')
    .headers({'Accept': 'application/json', 'Content-type': 'application/json'})
    .send(<%= currentAsset.name %>)
    .end(function (response) {
      console.log(response.body);
      callback();
    });

}
