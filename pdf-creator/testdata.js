var pdfGenerator = require("template-pdf-generator");
var fs = require("fs");
var data = {  name: "World"};
var template = "<h1>Hello {{name}}</h1>";
var css = "h1 {color: red}";
pdfGenerator(data, template, css).pipe(fs.createWriteStream("out.pdf"));
