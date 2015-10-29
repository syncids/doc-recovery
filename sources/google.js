var request = require('request');
var cheerio = require('cheerio');
var _ = require('lodash');
require('../utils/utils');

var dateReg = /(\w\w\w) (\d{1,2}), (\d\d\d\d)/;

module.exports.process = function(doc, cb) {
  if (!doc.actualNumber) {
    doc.actualNumber = doc.country + doc.number.slice(1);    
  }
  var url = 'http://www.google.com/patents/' + doc.actualNumber;

  function _cb(err) {
    setTimeout(function() {
      cb(err);
    }, 100);
  }

  process.stdout.write('\nGoogle: ' + doc.number + '->' + doc.actualNumber + ' ');

  request.get(url, function(e, r, html) {
    if (e) {
      doc.error = ['request error', e, html];
      process.stdout.write('error ' + doc.error);
      return _cb();
      //return cb(e.code + ': ' + url);
    }

    if (!html) {
      doc.error = 'emptyHtml';
      process.stdout.write('error ' + doc.error);
      return _cb();
    }

    var $ = cheerio.load(html);
    var dateStr = $('.patent-bibdata-heading:contains("Publication date")').siblings('td').html();

    var dateParts = dateReg.exec(dateStr);
    if (!dateParts) {
      doc.error = "invalidDate";
    }
    else {
      doc.publicationDate = dateParts[3] + '-' + convertToMonthNumber(dateParts[1]) + '-' + getDay(dateParts[2]);
    }

    if (doc.publicationDate) {
      delete doc.error;
    }

    process.stdout.write(' ' + doc.publicationDate);    
    _cb();
  });
};

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