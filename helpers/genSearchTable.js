var Handlebars = require("handlebars");

module.exports = function(result, options) {
    var table = "";
  result.forEach(entry => {
    entry.raw_name = entry.name.split(" ")[0]+"_"+entry.name.split(" ")[1];
    var row = "<tr>";
    row += `<td> ${entry.id}</td>`;
    row += `<td> ${entry.name}</td>`;
    row += `<td> ${entry.stufe}${entry.klassen_suffix}</td>`;
    row += `<td> ${entry.index}</td>`;
    row += `<td><a class="mx-5" href="/bewertung/neu/schuelerid=${
        entry.id
      }/kursid=${entry.id}">
        <i class="fas fa-file-alt"></i></a></td>`;
    row += `<td><a class="mx-5" href="/user?name=${
          entry.raw_name}">
          <i class="fas fa-info-circle"></i></a></td>`;
    table += row + "</tr>";
  });

  return new Handlebars.SafeString(table);
};
