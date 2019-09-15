var Handlebars = require("handlebars");
var datetime = require("node-datetime");
module.exports = function(Schuelerliste_) {
  var i = 1;
  var table = "";
  Schuelerliste = Schuelerliste_.sort().reverse();
  Schuelerliste.forEach(Schueler => {

    Schueler.raw_name = Schueler.name.replace(' ', '_');

    var row = "<tr>";
    row += `<td>${i}</td>`;
    row += `<td>${Schueler.vorname}</td>`;
    row += `<td>${Schueler.nachname}</td>`;
    //row += `<td>${Schueler.hatBewertung}/${Schueler.sollBewertung}</td>`;
    var dropdownKurse = "";
    if(Schueler.Bewertungen.length != 0){
      Schueler.Bewertungen.forEach(Bewertung => {
        dropdownKurse+= `<a class="dropdown-item">&bull; ${Bewertung}</a>`;
      })
    }else{
      dropdownKurse+= `<a class="dropdown-item"><i> Leider wurden noch keine Bewertungen abgegeben.</i></a>`;
    }
  
    row += `
    <td>
    <div class="dropdown">
      <a class="dropdown-toggle" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        ${Schueler.hatBewertung}/${Schueler.sollBewertung}
      </a>
      <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
        <a class="dropdown-item"><b>Bewertungen abgegeben:</b></a>
        <div class="dropdown-divider"></div>       
        ${dropdownKurse}
      </div>
    </div>
    </td>`;

    if(Schueler.hatBewertung == 0){
      row += `<td><a class="text-muted"><i class="fas fa-search"></i></a></td>`;
    }else{
      row += `<td><a href="/bewertung/view_sumup=${Schueler.id}"><i class="fas fa-search"></i></a></td>`;
    }

    if(Schueler.hatBewertung == 0){
      row += `<td><a class="text-muted"><i class="fas fa-download"></i></a></td>`;
    }else{
      row += `<td><a href="/bewertung/download_sumup=${Schueler.id}" data-toggle="modal" data-target="#date_update_modal_${Schueler.id}"><i class="fas fa-download"></i></a></td>`;
    }

    row += `<div class="modal fade" id="date_update_modal_${Schueler.id}" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">Datum des SELG</h5>
          <button class="close" type="button" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div class="modal-body">Geben Sie bitte das Datum an, an dem das Gespräch gehalten wird: <form class="form-inline">
        <div class="form-group">
            <label for=""></label>
            <input type="text" value="${datetime.create().format("d.m.y")}" name="date" id="date_${Schueler.id}" class="form-control" placeholder="" aria-describedby="helpId">
            <small id="helpId" class="text-muted">Format: Tag.Monat.Jahr</small>
        </div>
    </form></div>
        <div class="modal-footer">
          <a class="btn btn-primary text-light" onclick="`+"window.location.replace(`/bewertung/download_sumup="+Schueler.id+"?date=${document.getElementById(`${'date_'+'"+Schueler.id+"'}`).value}`)"+`">Download</a>
        </div>
      </div>
    </div>
  </div>`

    i++;
    row += `<td><a class="mx-5" href="/user?name=${
        Schueler.raw_name}">
        <i class="fas fa-info-circle"></i></a></td>`;
    table += row + "</tr>";
  });
  return new Handlebars.SafeString(table);
};
