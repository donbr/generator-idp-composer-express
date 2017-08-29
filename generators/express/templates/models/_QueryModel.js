'use strict';


const unirest = require('unirest');

// this module has the model functions relating to queries
// modify each query function to properly handle the content of the query
// rename the file to prevent subsequent generator runs from over-writing
// see the README.md file for details on how to use queries

<% for(var x=0;x<queryList.length;x++) { %>
// return data from query <%=queryList[x].name %>
// Description: <%=queryList[x].description %>
// <%=queryList[x].select %>
exports.<%=queryList[x].name %> = function (param1, apiPath, callback) {
  unirest.get(apiPath + '/api/queries/<%=queryList[x].name %>?param1=' + param1).end(function (response) {
    let ResultList = response.body;
    // do any enrichment here
    callback(ResultList);
  });
}
<% } %>
