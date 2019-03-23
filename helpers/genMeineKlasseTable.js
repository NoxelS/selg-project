var Handlebars = require("handlebars");

module.exports = function(Schuelerliste_) {
  var i = 1;
  var table = "";
  Schuelerliste = Schuelerliste_.sort().reverse();
  Schuelerliste.forEach(Schueler => {

    Schueler.raw_name = Schueler.name.split(" ")[0]+"_"+Schueler.name.split(" ")[1];

    var row = "<tr>";
    row += `<td>${i}</td>`;
    row += `<td>${Schueler.vorname}</td>`;
    row += `<td>${Schueler.nachname}</td>`;
    row += `<td>${Schueler.index}</td>`;
    row += `<td><a href="/bewertung/view_sumup=${Schueler.id}"><i class="fas fa-search"></i></a></td>`;
    row += `<td><a href="/bewertung/download_sumup=${Schueler.id}"><i class="fas fa-download"></i></a></td>`;
    i++;
    row += `<td><a class="mx-5" href="/user?name=${
        Schueler.raw_name}">
        <i class="fas fa-info-circle"></i></a></td>`;
    table += row + "</tr>";
  });
  return new Handlebars.SafeString(table);
};
