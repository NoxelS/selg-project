var Handlebars = require("handlebars");

module.exports = function(result, options) {
  var table = "";
  
  result.forEach(entry => {
    var row = "<tr>";
    row += `<td> ${entry.kursname}</td>`;
    row += `<td> ${entry.leistungsebene}</td>`;
    row += `<td> ${entry.schueler}</td>`;
    table += row + "</tr>";
  });

  return new Handlebars.SafeString(table);
};
