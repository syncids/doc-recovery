var request = require('request');
var cheerio = require('cheerio');
var _ = require('lodash');
require('../utils/utils');
module.exports.process = function(doc, cb) {
  doc.actualNumber = doc.actualNumber || (doc.country + doc.number.slice(1));
  var url = 'http://worldwide.espacenet.com/searchResults?submitted=true&DB=EPODOC&PN=' + doc.actualNumber;

  function _cb(err) {
    setTimeout(function() {
      cb(err);
    }, 3000);
  }

  process.stdout.write('\nEscapeNet: ' + doc.number + '->' + doc.actualNumber + ' ');

  request.get(url, {
    headers: {
      'Cookie': 'CAPTCHA_CHECK_RESULT=""; LevelXLastSelectedDataSource=EPODOC; org.springframework.web.servlet.i18n.CookieLocaleResolver.LOCALE=en_EP; JSESSIONID=vqBD17r+O19S6rVMklRP3QOU.espacenet_levelx_prod_3; currentUrl=http%3A%2F%2Fworldwide.espacenet.com%2FsearchResults%3Fsubmitted%3Dtrue%26DB%3DEPODOC%26PN%3DEP1078577A2; menuCurrentSearch=http%3A%2F%2Fworldwide.espacenet.com%2FsearchResults%3FDB%3DEPODOC%26PN%3DEP1078577A2; PGS=10',
      'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36',
      'Host': 'worldwide.espacenet.com'
    }
  }, function(e, r, html) {
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
    var $result = $('.modSearchResult .application .contentRowClass');

    if ($result.length === 0) {
      doc.error = 'noResults';
      process.stdout.write('error ' + doc.error);
      return _cb();
    }
    if ($result.length > 1) {
      doc.error = 'tooManyFound';
      process.stdout.write('error ' + doc.error);
      return _cb();
    }

    var pubInfoArr = $result
      .find('.publicationInfoColumn').text().replace('Publication info:', '')
      .split('\n')
      .filter(function(v) { return v.trim(); })
      .map(function(v) { return v.replace(/\s\(/, '').replace(')', ' ').trim(); });

    var matchedDate = pubInfoArr.find(function(v) {
      var match = RegExp(doc.actualNumber + ' (\\d\\d\\d\\d-\\d\\d-\\d\\d)').exec(v);
      if (match) {
        doc.publicationDate = match[1];
      }
      return match;
    });

    if (!matchedDate) {
      doc.error = 'noDateFound';
    }

    // var inventorArr = $result
    //   .find('.inventorColumn').text().replace('Inventor:', '')
    //   .split('\n')
    //   .filter(function(v) { return v.trim(); })
    //   .map(function(v) { return v.replace(/\s\(/, '').replace(')', ' ').trim(); });

    // if (!inventorArr.length) {
    //   doc.error += ' ' + 'noInventorFound';
    // }
    // else {
    //   doc.inventor = inventorArr[0].extractLastNameAtStart();
    // }

    if (doc.inventor && doc.publicationDate) {
      delete doc.error;
    }

    process.stdout.write(' ' + doc.publicationDate);    
    _cb();
  });
}
