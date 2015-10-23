/* global require, process */
//var _ = require('lodash');
var request = require('request');
var async = require('async');
var docs = require('./docs.json');
var fs = require('fs');
var Entities = require('html-entities').AllHtmlEntities; 
var entities = new Entities();

var reg = /<b>United States Patent <\/b>[\s\S]*?<TD align="right"[\s\S]*?<\/B>(.*?)\s*<\/b>[\s\S]*?<TD align="left"[\s\S]*?<b>\s*([.\s\S]*?)\s*?<\/b>[\s\S]*?<TD align="right"[\s\S]*?<b>[\s\*]*(.*?)\s*?<\/b>/;

var proccessingDocs = docs.filter(function(doc){
  var hasData = doc.inventor && doc.publicationDate;
  return !hasData && doc.error !== 'notFoundInHtml';
});

console.log('processing ' + proccessingDocs.length);

async.eachSeries(proccessingDocs, function(doc, _cb) {
  function cb(err) {
    setTimeout(function() {
      _cb(err);
    }, 50)
  }

  var url = 'http://patft.uspto.gov/netacgi/nph-Parser?Sect1=PTO1&Sect2=HITOFF&d=PALL&p=1&u=/netahtml/PTO/srchnum.htm&r=1&f=G&l=50&s1=' + doc.number + '.PN.&OS=PN/' + doc.number + '&RS=PN/' + doc.number;
  request.get(url, function(e, r, html) {
    process.stdout.write(doc.number + ',');
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
      return cb();
    }

    if (html.indexOf('No patents have matched your query') > -1) {
      doc.error = 'notFound';
      write();
      return cb();
    }

    // if (html.indexOf('Full text is not available for this patent') > -1) {
    //   doc.error = 
    // }

    var match = reg.exec(html);
    if (!match) {
      doc.error = 'notFoundInHtml';
    } else {
      var docNumber = match[1].replace(/,/g, '');
      if (docNumber !== doc.number) {
        doc.error = 'numbersNotMatch - ' + docNumber;
      }

      var dateParts = match[3].replace(',', '').split(' ');
      var month = convertToMonthNumber(dateParts[0]);
      if (month.indexOf('invalidmonth_') === 0) {
        doc.error = ['invalidDate', match[1], match[2], match[3]];
        write();
        return cb();
      }

      delete doc.error;
      doc.inventor = entities.decode(match[2]).replace(/\n/g, ' ');
      // date is August 23, 1999
      doc.publicationDate = dateParts[2] + '-' + month + '-' + getDay(dateParts[1]);
    }
    write();
    cb();
  });
}, function(err) {
  console.log('\ndone ', err);
  process.exit();
});

function write() { 
 fs.writeFileSync('docs.json', JSON.stringify(docs, null, 2));    
}

function getDay(day) {
  return day.length === 2 ? day : '0' + day;
}

function convertToMonthNumber(str) {
  switch (str) {
    case 'January':
      return '01';
    case 'February':
      return '02';
    case 'March':
      return '03';
    case 'April':
      return '04';
    case 'May':
      return '05';
    case 'June':
      return '06';
    case 'July':
      return '07';
    case 'August':
      return '08';
    case 'September':
      return '09';
    case 'October':
      return '10';
    case 'November':
      return '11';
    case 'December':
      return '12';
    default:
      return 'invalidmonth_' + str;
  }

}