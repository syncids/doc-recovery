var request = require('request');
var cheerio = require('cheerio');
var _ = require('lodash');
require('../utils/utils');

var dateReg = /(\w{3,9}) (\d{1,2}), (\d\d\d\d)/;

module.exports.process = function(doc, cb) {
  if (!doc.actualNumber) {
    doc.actualNumber = doc.country + doc.number.slice(1);    
  }
  var url = 'http://www.sumobrain.com/patents/' + doc.actualNumber + '.html';

  function _cb(err) {
    setTimeout(function() {
      cb(err);
    }, 500);
  }

  process.stdout.write('\nSumobrain: ' + doc.number + '->' + doc.actualNumber + ' ');

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
    var dateStr = $('.disp_elm_name:contains("Publication Date:")').siblings('div').text().trim();

    var dateParts = dateReg.exec(dateStr);
    if (!dateParts) {
      doc.error = "invalidDate: " + dateStr;
    }
    else {
      doc.publicationDate = dateParts[3] + '-' + dateParts[1].convertToMonthNumber() + '-' + getDay(dateParts[2]);
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
