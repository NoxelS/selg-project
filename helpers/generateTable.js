var Handlebars = require("handlebars");

module.exports = function(Schuelerliste, options) {
  const Kurs = options.data.root.kurs;

  console.log(Kurs);
  var i = 1;
  var table = "";
  Schuelerliste.forEach(Schueler => {
    var row = "<tr>";
    
    Object.entries(Schueler).forEach(([key, value]) => {
      row += `<td> ${i}</td>`;
      row += `<td> ${value.name}</td>`;
      row += `<td> ${value.stufe}${value.klassen_suffix}</td>`;
      row += `<td> ${value.geburtsdatum}</td>`;
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
