/* global require, process */
//var _ = require('lodash');
var file = './us_docs_11.json';
var util = require('util');
var request = require('request');
var async = require('async');
var docs = require(file);
var fs = require('fs');
var cheerio = require('cheerio');
var _ = require('lodash');
require('./utils/utils');

var dateReg = /(\w\w\w) (\d{1,2}), (\d\d\d\d)/;

var proccessingDocs = docs.filter(function(doc){
  if (!doc.inventor) return false;

  return doc.inventor.length === 1;
  var hasSpecialChar = doc.inventor && /\W/.test(doc.inventor.replace('-', ''));
  if (hasSpecialChar) console.log(doc.number, doc.inventor)
  return hasSpecialChar;
  // var hasData = doc.inventor && doc.publicationDate;
  // return !hasData;
});

console.log('processing ' + proccessingDocs.length);

async.eachSeries(proccessingDocs, function(doc, cb) {

  function _cb(err) {
    setTimeout(function() {
      cb(err);
    }, 500);
  }

  var url = util.format('http://appft1.uspto.gov/netacgi/nph-Parser?Sect1=PTO1&Sect2=HITOFF&d=PG01&p=1&u=/netahtml/PTO/srchnum.html&r=1&f=G&l=50&s1=%s.PGNR.', doc.number);
  request.get(url, function(e, r, html) {
    process.stdout.write('\n' + doc.number + ' ');
    if (html) {
      var $ = cheerio.load(html);
      var inventors = $('td:contains("Inventors")').siblings('td').text();
      var inventor = /[\w']+/.exec(inventors);
      if (!inventor || inventors.length === 0) {
        process.stdout.write('bad inventor: ' + inventors);
      }
      else {
        var oldValue = doc.inventor;
        doc.inventor = inventor[0];
        process.stdout.write(' ' + oldValue +' -> ' +doc.inventor + ' ');
        write();
      }
    }
    return _cb()

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
    var dateStr = $('.patent-bibdata-heading:contains("Publication date")').siblings('td').html()
    var dateParts = dateReg.exec(dateStr);
    if (!dateParts) {
      doc.error = "invalidDate";
    }
    else {
      doc.publicationDate = dateParts[3] + '-' + convertToMonthNumber(dateParts[1]) + '-' + getDay(dateParts[2]);
      process.stdout.write(doc.publicationDate + ' ');
    }

    var inventorStr = $('.patent-bibdata-heading:contains("Inventors")').siblings('td').find('a').html();

    if (!inventorStr) {
      doc.error = doc.error || '';
      doc.error += ' invalidInventor'; 
      process.stdout.write(doc.error);
    }
    else {
      var inventorNameParts = inventorStr.split(' ')
      doc.inventor = inventorNameParts(inventorNameParts.length - 1);

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

function getDay(day) {
  return day.length === 2 ? day : '0' + day;
}

function convertToMonthNumber(str) {
  switch (str) {
    case 'Jan':
      return '01';
    case 'Feb':
      return '02';
    case 'Mar':
      return '03';
    case 'Apr':
      return '04';
    case 'May':
      return '05';
    case 'Jun':
      return '06';
    case 'Jul':
      return '07';
    case 'Aug':
      return '08';
    case 'Sep':
      return '09';
    case 'Oct':
      return '10';
    case 'Nov':
      return '11';
    case 'Dec':
      return '12';
    default:
      return 'invalidmonth_' + str;
  }

}