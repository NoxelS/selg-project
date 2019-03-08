var Handlebars = require("handlebars");

module.exports = function(result, options) {
    var table = "";
  result.forEach(entry => {
    var row = "<tr>";
    row += `<td> ${entry.id}</td>`;
    row += `<td> ${entry.name}</td>`;
    row += `<td> ${entry.stufe}${entry.klassen_suffix}</td>`;
    row += `<td> ${/*value.geburtsdatum*/ "01.01.2000"}</td>`;
    row += `<td> ${entry.index}</td>`;
    row += `<td><a class="mx-5" href="/bewertung/neu/schuelerid=${
        entry.id
      }/kursid=${entry.id}">
        <i class="fas fa-file-alt"></i></a></td>`;
    table += row + "</tr>";
  });

  return new Handlebars.SafeString(table);
};
