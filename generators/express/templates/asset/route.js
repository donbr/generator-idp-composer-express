'use strict';

const express = require('express');
const router = express.Router();
const <%= currentAsset.name %>Model = require('../models/<%= currentAsset.name %>Model');

// handle the URL /<%= currentAsset.name %>
router.get('/', function(req, res, next) {

  let <%= currentAsset.name %>List;
  <%= currentAsset.name %>Model.getAll(req.app.get('api path'), function (<%= currentAsset.name %>List) {
    res.render('<%= currentAsset.name %>-list',
               { title: '<%= currentAsset.name %> List',
                 <%= currentAsset.name %>List: <%= currentAsset.name %>List,
                 properties: <%= currentAsset.name %>List});
  });
});

// handle the URL /<%= currentAsset.name %>/new
router.get('/new', function(req, res, next) {
    res.render('<%= currentAsset.name %>-new',
               { title: 'New <%= currentAsset.name %>'});
});

// handle the URL /<%= currentAsset.name %>/create
router.get('/create', function(req, res, next) {
  // create the <%= currentAsset.name %> object - $class & id will be added in the model
  let <%= currentAsset.name %> = {
    <% for(var x=0;x<currentAsset.properties.length;x++) {
        if(currentAsset.properties[x].name.localeCompare(assetIdentifier)!=0) {
          if(x==currentAsset.properties.length-1) { %>
    "<%= currentAsset.properties[x].name %>": req.query.<%= currentAsset.properties[x].name %><% } else { %>"<%= currentAsset.properties[x].name %>": req.query.<%= currentAsset.properties[x].name %>,
        <% }
         }
       } %>
  };
  // call the 'create' method in the model, then show the list view
  <%= currentAsset.name %>Model.create(<%= currentAsset.name %>, req.app.get('api path'), function () {
    res.redirect('/<%= currentAsset.name %>-list');
  });
});

// handle the URL /<%= currentAsset.name %>/1234
router.get('/:id', function(req, res, next) {

  let <%= currentAsset.name %>;
  <%= currentAsset.name %>Model.getById(req.params.id, req.app.get('api path'), function (<%= currentAsset.name %>) {
    res.render('<%= currentAsset.name %>-detail',
               { title: '<%= currentAsset.name %> Detail',
                 <%= currentAsset.name %>: <%= currentAsset.name %>});
  });
});


module.exports = router;
