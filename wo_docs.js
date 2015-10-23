/* global require, process */
//var _ = require('lodash');
var request = require('request');
var async = require('async');
var docs = require('./wo_docs.json');
var fs = require('fs');
var cheerio = require('cheerio');
var _ = require('lodash');

var dateReg = /(\d\d).(\d\d).(\d\d\d\d)/;
var inventorReg = /1\)[\s\S]*?(\w+)/;

var proccessingDocs = docs.filter(function(doc){
  var hasData = doc.publicationDate;
  return !hasData;
});

console.log('processing ' + proccessingDocs.length);

async.eachSeries(proccessingDocs, function(doc, cb) {
  if (doc.number[0] !== '0') {
    doc.error = 'noLeadingZero';
    write();
    return cb();
  }

  var actualNumber = doc.number.slice(1).replace('WO', '');

  if (actualNumber.match('^00')) {
    doc.actualNumber = '200' + actualNumber;
  }
  else if (actualNumber.match('^0')) {
    doc.actualNumber = '20' + actualNumber;
  }
  else if (actualNumber.match('^[98]')) {
    doc.actualNumber = '19' + actualNumber;
  }  
  else {
    doc.actualNumber = actualNumber;
  }
  
  doc.actualNumber = doc.actualNumber.replace('US', '');

  var matches = /(\d{4})(\d{5})/.exec(doc.actualNumber);
  if (matches) {
    // prepend 0
    doc.actualNumber = matches[1] + '0' + matches[2];
  }

  function _cb(err) {
    setTimeout(function() {
      cb(err);
    }, 300);
  }

  var url = 'https://patentscope.wipo.int/search/en/detail.jsf?docId=WO' + (doc.actualNumber || doc.number);
  console.log('\n\n' + url);
  request.get(url, {
    headers: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.8,vi;q=0.6',
      'Cookie': 'JSESSIONID=EE20B7A73CA821C01F08150EE3EE024E.wapp2nB; BSWA=balancer.bswa2; wipo_language=en; ABIW=balancer.cms41; __utma=99021848.500763500.1445540867.1445540867.1445540867.1; __utmc=99021848; __utmz=99021848.1445540867.1.1.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=(not%20provided)',
      'Host': 'patentscope.wipo.int',
      'Pragma': 'no-cache',
      'Upgrade-Insecure-Requests': '1',
      'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.99 Safari/537.36'
    }
  }, function(e, r, html) {
    process.stdout.write(doc.number + ' -> ' + doc.actualNumber);
    if (e) {
      doc.error = ['request error', e, html];
      write();
      console.log(e.code + ': ' + url);
      return setTimeout(function() {
        _cb();
      }, 2000);
    }
    if (!html) {
      doc.error = 'emptyHtml';
      write();
      return _cb();
    }

    var $ = cheerio.load(html);

    if (!$('body').length) {
      doc.error = 'noBody';
      write();
      return _cb();
    }

    var dateStr = $('#detailPCTtablePubDate').html();
    var dateParts = dateReg.exec(dateStr);

    if (!dateParts) {
      doc.error = "invalidDate";
      process.stdout.write('invalidDate: ' + url);
    }
    else {
      doc.publicationDate = dateParts[3] + '-' + dateParts[2] + '-' + dateParts[1];
      process.stdout.write(' ' + doc.publicationDate + ' ');
    }

    if (doc.publicationDate) {
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
 fs.writeFileSync('wo_docs.json', JSON.stringify(docs, null, 2));    
}
