/* global require, process */
//var _ = require('lodash');
var request = require('request');
var async = require('async');
var docs = require('./docs.json');
var fs = require('fs');
var cheerio = require('cheerio');
var _ = require('lodash');

var dateReg = /(\d\d\d\d)(\d\d)(\d\d)/;
var inventorReg = /1\)[\s\S]*?(\w+)/;

var proccessingDocs = docs.filter(function(doc){
  var hasData = doc.inventor && doc.publicationDate;
  return !hasData && doc.error === 'notFoundInHtml';
});

console.log('processing ' + proccessingDocs.length);

async.eachSeries(proccessingDocs, function(doc, cb) {

  function _cb(err) {
    setTimeout(function() {
      cb(err);
    }, 6000)
  }

  var query = (doc.country || 'US') + doc.number;
  var url = 'http://ops.epo.org/3.1/rest-services/published-data/publication/epodoc/' + query + '/biblio';
  request.get(url, function(e, r, html) {
    process.stdout.write('\n' + doc.number + ' ');
    if (e) {
      doc.error = ['request error', e, html];
      write();
      console.log(e.code + ': ' + url);
      return setTimeout(function() {
        _cb();
      }, 2000);
      //return cb(e.code + ': ' + url);
    }

    if (!html) {
      doc.error = 'emptyHtml';
      write();
      return _cb();
    }

    var $ = cheerio.load(html);
    var dateStr = $('[document-id-type=epodoc] date').html();
    var dateParts = dateReg.exec(dateStr);

    if (!dateParts) {
      doc.error = "invalidDate";
    }
    else {
      doc.publicationDate = dateParts[1] + '-' + dateParts[2] + '-' + dateParts[3];
      process.stdout.write(doc.publicationDate + ' ');
    }

    var inventorStr = $('inventors inventor[sequence=1][data-format=epodoc] name').html();

    if (!inventorStr) {
      doc.error = doc.error || '';
      doc.error += ' invalidInventor'; 
      process.stdout.write(doc.error);
    }
    else {
      doc.inventor = _.capitalize(inventorStr.split(' ')[0].toLowerCase());
      process.stdout.write(doc.inventor + ' ');
    }

    if (doc.inventor && doc.publicationDate) {
      delete doc.error;
    }

    write();
    _cb();
  });
}, function(err) {
  console.log('\ndone ', err);
  process.exit();
});

function write() { 
 fs.writeFileSync('docs.json', JSON.stringify(docs, null, 2));    
}
