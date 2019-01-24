var Handlebars = require("handlebars");

module.exports = function(Schuelerliste_, options) {
  const Kurs = options.data.root.kurs;

  var i = 1;
  var table = "";
  Schuelerliste = Schuelerliste_.sort().reverse();
  Schuelerliste.forEach(Schueler => {
    var row = "<tr>";
    
    Object.entries(Schueler).forEach(([key, value]) => {
      row += `<td> ${i}</td>`;
      row += `<td> ${value.name}</td>`;
      row += `<td> ${value.stufe}${value.klassen_suffix}</td>`;
      row += `<td> ${/*value.geburtsdatum*/"01.01.2000"}</td>`;
      row += `<td> ${value.index}</td>`;
      row += `<td><a class="mx-5" href="/bewertung/neu/schuelerid=${
        value.id
      }/kursid=${Kurs.id}">
        <i class="fas fa-file-alt"></i></a></td>`;
      i++;
    });

    table += row + "</re>";
  });
  return new Handlebars.SafeString(table);
};
