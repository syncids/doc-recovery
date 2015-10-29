/* global require, process */
//var _ = require('lodash');
var file = './wo_docs.json';
var request = require('request');
var async = require('async');
var docs = require(file);
var fs = require('fs');
var escapenet = require('./sources/escapenet');

var dateReg = /(\d\d).(\d\d).(\d\d\d\d)/;
var inventorReg = /1\)[\s\S]*?(\w+)/;

var proccessingDocs = docs.filter(function(doc){
  var hasData = doc.publicationDate;
  delete doc.inventor;
  return doc.number.match(/\d[ABC]\d$/);
});
var start = false;
console.log('processing ' + proccessingDocs.length);
async.eachSeries(proccessingDocs, function(doc, cb) {
  if (!start) {
    if (doc.number !== '002087400A1') {
      return cb();
    }
    start = true;
  }
  doc.country = 'WO';
  delete doc.publicationDate;
  escapenet.process(doc, function() {
    write();
    cb();
  });
}, function(err) {
  console.log('\ndone ', err);
  process.exit();
});

function write() { 
 fs.writeFileSync(file, JSON.stringify(docs, null, 2));    
}
