'use strict';


const unirest = require('unirest');

// this module has the model functions relating to user transactions

<% for(var x=0;x<transactionList.length;x++) { %>
exports.<%=transactionList[x].name%> = function (trx, apiPath, callback) {
  // input variables can be short (e.g. ID:1234) or fully qualified
  // if short, expand them here
  <% var propertyList = transactionList[x].properties; for(var p=0;p<propertyList.length;p++) { %>
  if (!trx.<%=propertyList[p].name%>.includes("#")) {
    trx.<%=propertyList[p].name%> = "resource:<%=transactionList[x].namespace%>.<%=propertyList[p].type%>#" + trx.<%=propertyList[p].name%>;
  }
  <% } %>
  trx.$class = "<%=transactionList[x].namespace%>.<%=transactionList[x].name%>";
  trx.timestamp = new Date().toISOString();

  unirest.post(apiPath + '/api/<%=transactionList[x].name%>/')
    .headers({'Accept': 'application/json', 'Content-type': 'application/json'})
    .send(trx)
    .end(function (response) {
      console.log(response.body);
      callback();
    });
}
<% } %>
