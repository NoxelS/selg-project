var Handlebars = require("handlebars");

module.exports = function(bewertungsarray) {
  var table = "";
  var i = 1;
  bewertungsarray.forEach(entry => {
    var row = "<tr>";
    row += `<td> ${i}</td>`;
    row += `<td> ${entry.kurs_name} ${entry.leistungsebene}</td>`;
    row += `<td> ${entry.schueler_name}</td>`;
    row += `<td> ${entry.date}</td>`;
    row += `<td><a href="/bewertung/view=${entry.id}"><i class="fas fa-edit"></i></a></td>`;
    table += row + "</tr>";
    i++;
  });

  return new Handlebars.SafeString(table);
};
