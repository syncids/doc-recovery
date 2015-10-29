/* global require, process */
var fs = require('fs');
var _ = require('lodash');
var util = require('util');

generateForeign();
function generateForeign() {
  var file = './foreign_docs.';
  var docs = require(file + 'json');
  var proccessingDocs = docs.filter(function(doc){
    return doc.publicationDate;
  });

  var str = '';
  console.log('generating: ' + proccessingDocs.length);
  proccessingDocs.forEach(function(doc) {
    str += util.format('UPDATE new.artdb SET PublicationDate="%s" WHERE Country="%s" AND DocumentNumber="%s" AND Type="Foreign";\n',
      doc.publicationDate,
      doc.country,
      doc.number);
  });

  fs.writeFileSync(file + 'sql', str);   
}

// generateWoDocs();
// function generateWoDocs() {  
//   var file = './wo_docs.';
//   var docs = require(file + 'json');
//   var proccessingDocs = docs.filter(function(doc){
//     return doc.publicationDate;
//   });

//   var str = '';
//   proccessingDocs.forEach(function(doc) {
//     str += util.format('UPDATE new.artdb SET PublicationDate="%s" WHERE Country="WO" AND DocumentNumber="%s";\n',      
//       doc.publicationDate,
//       doc.number);
//   });

//   fs.writeFileSync(file + 'sql', str); 
// }

// generateEpDocs();
// function generateEpDocs() {  
//   var file = './ep_docs.';
//   var docs = require(file + 'json');
//   var proccessingDocs = docs.filter(function(doc){
//     return doc.publicationDate;
//   });

//   var str = '';
//   proccessingDocs.forEach(function(doc) {
//     str += util.format('UPDATE new.artdb SET PublicationDate="%s" WHERE Type="EP" AND DocumentNumber="%s";\n',      
//       doc.publicationDate,
//       doc.number);
//   });

//   fs.writeFileSync(file + 'sql', str); 
// }

// usDocs11();
// function usDocs11() {  
//   var file = './us_docs_11.';
//   var docs = require(file + 'json');
//   var proccessingDocs = docs.filter(function(doc){
//     return doc.publicationDate && doc.inventor;
//   });

//   var str = '';
//   proccessingDocs.forEach(function(doc) {
//     str += util.format('UPDATE new.artdb SET PublicationDate="%s",Inventor="%s" WHERE Type="US" AND DocumentNumber="%s";\n',      
//       doc.publicationDate,
//       doc.inventor,
//       doc.number);
//   });

//   fs.writeFileSync(file + 'sql', str); 
// }


