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
exports.create = function (<%= currentAsset.name %>, apiPath, callback) {
  // add the class and id to the <%= currentAsset.name %>
  <%= currentAsset.name %>.$class = "<%= namespace %>.<%= currentAsset.name %>";
  <%= currentAsset.name %>.<%= assetIdentifier %> = "ID:" + Math.trunc(Math.random() * 10000);

  // call the 'POST' API
  unirest.post(apiPath + '/api/<%= currentAsset.name %>')
    .headers({'Accept': 'application/json', 'Content-type': 'application/json'})
    .send(<%= currentAsset.name %>)
    .end(function (response) {
      console.log(response.body);
      callback();
    });

}

// update an existing <%= currentAsset.name %> with new data
// NB you can't change the id field
exports.update = function (<%= currentAsset.name %>, apiPath, callback) {
  // add the class to the <%= currentAsset.name %>
  <%= currentAsset.name %>.$class = "<%= namespace %>.<%= currentAsset.name %>";

  // call the 'PUT' API
  unirest.put(apiPath + '/api/<%= currentAsset.name %>/' + <%= currentAsset.name %>.<%= assetIdentifier %>)
    .headers({'Accept': 'application/json', 'Content-type': 'application/json'})
    .send(<%= currentAsset.name %>)
    .end(function (response) {
      console.log(response.body);
      callback();
    });

}

// delete a <%= currentAsset.name %>
exports.delete = function (id, apiPath, callback) {
  // call the 'DELETE' API
  unirest.delete(apiPath + '/api/<%= currentAsset.name %>/' + id)
    .headers({'Accept': 'application/json', 'Content-type': 'application/json'})
    .end(function (response) {
      console.log(response.body);
      callback();
    });

}
