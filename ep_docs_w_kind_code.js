/* global require, process */
//var _ = require('lodash');
var file = './ep_docs.json';
var request = require('request');
var async = require('async');
var docs = require(file);
var fs = require('fs');
var cheerio = require('cheerio');
var _ = require('lodash');

var dateReg = /(\d\d\d\d)(\d\d)(\d\d)/;
var inventorReg = /1\)[\s\S]*?(\w+)/;

var proccessingDocs = docs.filter(function(doc){
  return /\d[A-C]\d$/.test(doc.number);
});

console.log('processing ' + proccessingDocs.length);
async.eachSeries(proccessingDocs, function(doc, cb) {

  function _cb(err) {
    setTimeout(function() {
      cb(err);
    }, 6000)
  }

  var query = (doc.country || 'EP') + doc.number.slice(1);
  var url = 'http://ops.epo.org/3.1/rest-services/published-data/publication/epodoc/' + query + '/biblio';
  console.log('\n' + url)
  request.get(url, function(e, r, html) {
    process.stdout.write(doc.number + ' ');
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
 fs.writeFileSync(file, JSON.stringify(docs, null, 2));    
}
