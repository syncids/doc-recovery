/* global require, process */
//var _ = require('lodash');
var file = './foreign_docs.json';
var async = require('async');
var docs = require(file);
var fs = require('fs');
var escapenet = require('./sources/escapenet');
var google = require('./sources/google');
var sumobrain = require('./sources/sumobrain');
var ipexl = require('./sources/ipexl');

var proccessingDocs = docs.filter(function(doc){
  return !doc.publicationDate;
});

var i = 0;
console.log('processing ' + proccessingDocs.length);
async.eachSeries(proccessingDocs, function(doc, cb) {
  var processor = getProcessor(doc);
  processor.process(doc, function() {
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

function getProcessor(doc) {  
  switch(doc.country) {
    case 'CA':
    case 'DE':
    case 'CN':
    case 'WO':
    case 'US':
      return google;
    case 'GB':
    case 'FR':
      return ipexl;
    case 'JP':
      return sumobrain;
    default:
      return escapenet;
  }
}