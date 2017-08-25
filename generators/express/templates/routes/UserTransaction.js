'use strict';

const express = require('express');
const router = express.Router();
const UserTransactionModel = require('../models/UserTransactionModel');

<% for(var x=0;x<transactionList.length;x++) { %>
// handle the URL /trx/<%=transactionList[x].name%> - this shows the page for entering data
router.get('/<%=transactionList[x].name%>', function(req, res, next) {
    res.render('<%=transactionList[x].name%>',
               { title: '<%=transactionList[x].name%>'});
});

// handle the URL /trx/<%=transactionList[x].name%>/x - this handles the actual execution
router.get('/<%=transactionList[x].name%>/x', function(req, res, next) {
  // create the transaction - $class, id & timestamp will be added in the model
  let trx = {
  <% var propertyList = transactionList[x].properties; for(var p=0;p<propertyList.length;p++) {
    if(p==propertyList.length-1) { %>
    "<%=propertyList[p].name%>": req.query.<%=propertyList[p].name%><% } else { %>"<%=propertyList[p].name%>": req.query.<%=propertyList[p].name%>,
    <% }
    } %>
  };
  // call the transaction method in the model, then show the transaction view
  UserTransactionModel.<%=transactionList[x].name%>(trx, req.app.get('api path'), function () {
    res.redirect('/Transaction');
  });
});

<% } %>


module.exports = router;
