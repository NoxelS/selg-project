var Handlebars = require("handlebars");

module.exports = function(result, options) {
    var table = "";
    let i = 1;
  result.forEach(entry => {
    entry.raw_name = entry.name.split(" ")[0]+"_"+entry.name.split(" ")[1];
    var row = "<tr>";
    row += `<td> ${i}</td>`;
    row += `<td> ${entry.name}</td>`;
    row += `<td> ${entry.stufe}${entry.klassen_suffix}</td>`;
    row += `<td> ${entry.index}</td>`;
    row += `<td>
              <div class="dropdown">
              <i class="fas fa-file-alt dropdown-toggle text-primary" data-toggle="dropdown"></i>
              <ul class="dropdown-menu px-3">
                <li>Neue Bewertung im Fach:</li>
                <hr class="my-1 py-0">
           `;
    

    // Alle Kurse in denen der Schüler ist:
    console.log(entry);

    for(let k = 0; k < entry.kurse_belegt.length; k++){
      row+= `<li><a href="/bewertung/neu/schuelerid=${entry.id}/kursid=${entry.kurse_belegt[k].id}">- ${entry.kurse_belegt[k].name}</a></li>`
    }

    row+=`
              </ul>
              </div>
            </td>
          `;
    row += `<td><a class="mx-5" href="/user?name=${
          entry.raw_name}">
          <i class="fas fa-info-circle"></i></a></td>`;
    table += row + "</tr>";
    i++;
  });

  return new Handlebars.SafeString(table);
};
