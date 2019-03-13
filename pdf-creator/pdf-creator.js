/*let pdf = require("handlebars-pdf");
let fs = require("fs");
let paths = __dirname + "/test-" + Math.random() + ".pdf";
let temp;
fs.readFile( __dirname+'/doc-template.hbs', function (err, data) {
    if (err) throw err;
    
    
    let document = {
    template: data,
    context: {
      display_name: "Noel Schwabenland"
    },
    path: paths
    };
  
  pdf
    .create(document)
    .then(resPDF => {
      console.log(resPDF);
    })
    .catch(error => {
      console.error(error);
    });
  
  });
*/

var fs = require('fs');
var pdf = require('html-pdf');
var html = fs.readFileSync('./doc-template.hbs', 'utf8');
var options = { 
    "format": 'Letter',
    "zoomFactor": '0.1',
 };

pdf.create(html, options).toFile('./businesscard.pdf', function(err, res) {
  if (err) return console.log(err);
  console.log(res); // { filename: '/app/businesscard.pdf' }
});