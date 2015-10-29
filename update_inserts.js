var _ = require('lodash');
var file = './original_art_inserts.sql';
var rl = require('readline').createInterface({
  input: require('fs').createReadStream(file)
});

var rowsPerLine = 5000;

var insertLine = 'INSERT INTO `artdb` VALUES (';
var rows = [];

var printed = false;
rl.on('line', function(line) {
  if (line.indexOf(insertLine) === -1) return;

  var newRows = line.slice(0, line.length - 2).replace(insertLine, '').split('),(');
  for(var i = 0; i < newRows.length; i++){
    if (newRows[i].split(',').length !== 13) console.log('not 13 - ' + newRows[i].split(',').length + '\n' + newRows[i]);
    rows.push('(' + newRows[i] + ')');
  }
});

rl.on('close', function() {
  update(rows);
});


function update() {
  console.log('updating ' + rows.length + ' rows')
  updateDocs();
}


function updateDocs() {
  var file = './docs.json';
  var docs = require(file);

  // _.each(docs, function(doc) {
  //   if (doc.error || !doc.inventor || !doc.publicationDate) return;

  //   updateRow(_.extend{{

  //   }})
  // });
}

function updateRow(doc) {

}

