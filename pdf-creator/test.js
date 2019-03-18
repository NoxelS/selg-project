'use strict';

var pdf = require('phantom-html2pdf');

var pdfOptions = {
  "html": "./test.html",
  paperSize: {
    format: 'A4',
    orientation: 'portrait',
    border: '1cm'
  }
};

pdf.convert(pdfOptions, function(err, result) {
  result.toFile("./SELG-Protokoll.pdf", function() {
    console.log('Done');
  });
});