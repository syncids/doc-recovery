/* global require, process */
var fs = require('fs');
var _ = require('lodash');
var docs = require('./docs.json');
var util = require('util');

var proccessingDocs = docs.filter(function(doc){
  return doc.inventor && doc.publicationDate;
});

var str = '';

proccessingDocs.forEach(function(doc) {
  str += util.format('UPDATE new.artdb SET Inventor="%s", PublicationDate="%s" WHERE Type="US" AND DocumentNumber="%s";\n',
    doc.inventor,
    doc.publicationDate,
    doc.number);
});

fs.writeFileSync('us_docs.sql', str);