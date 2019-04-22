var Handlebars = require("handlebars");

module.exports = function(Schuelerliste_, options) {
  const Kurs = options.data.root.kurs;

  var i = 1;
  var table = "";
  Schuelerliste = Schuelerliste_.sort().reverse();
  Schuelerliste.forEach(Schueler => {
    var row = "<tr>";

    row += `<td> ${i}</td>`;
    row += `<td> ${Schueler[0].name}</td>`;
    row += `<td> ${Schueler[0].stufe}${Schueler[0].klassen_suffix}</td>`;
    

    var next = Schuelerliste.length !== i ? (Schuelerliste[i][0].id+"-"+Kurs.id) : "null";
    
    if(Schueler[0].isDone){
      row += `<td><a style="color: inherit;" href="/bewertung/view=${Schueler[0].bewertungs_id}">
      <i class="fas fa-edit text-success"></i><span class="ml-2">Ansehen & Bearbeiten</span></a></td>`;
    }else{
      row += `<td><a style="color: inherit;" href="/bewertung/neu/schuelerid=${
        Schueler[0].id
      }/kursid=${Kurs.id}?next=${next}">
      <i class="fas fa-file-alt text-primary"></i><span class="ml-2">Bewertung erstellen</span></a></td>`;
    }
    
   
    i++;
  
    table += row + "</tr>";
  });
  return new Handlebars.SafeString(table);
};
