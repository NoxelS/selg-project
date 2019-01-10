var Handlebars = require("handlebars");
const db = require("../db");
const Promise = require("promise");

module.exports = function(meineKurse) {
    let dropdown = "";
    for(let i = 0; i < meineKurse.length; i++){
        dropdown+= `<a class="dropdown-item" href="/kurs/${meineKurse[i].id}"><span><i class="pull-right fas fa-caret-right"></i> ${meineKurse[i].name} ${meineKurse[i].jahrgang}-${meineKurse[i].leistungsebene}</span></a>`;
    }
    console.log(meineKurse);
    return new Handlebars.SafeString(dropdown);

};
