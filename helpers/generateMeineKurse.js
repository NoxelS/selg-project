var Handlebars = require("handlebars");
const db = require("../db");
const Promise = require("promise");

module.exports = function(meineKurse_unsroted) {
  let meineKurse = meineKurse_unsroted.sort((a, b) => {
    return b.jahrgang - a.jahrgang;
  });
  let dropdown = "";
  for (let i = 0; i < meineKurse.length; i++) {
    let kursName = meineKurse[i].name;
    if (meineKurse[i].name.length >= 13) {
      kursName =  meineKurse[i].name.split("")[0].toUpperCase() + meineKurse[i].name.substring(1,9)+"...";
    }else{
        kursName =  meineKurse[i].name.split("")[0].toUpperCase() + meineKurse[i].name.substring(1);
    }

    if (
      (meineKurse[i].jahrgang >= 7 && meineKurse[i].type == "deutsch") ||
      (meineKurse[i].jahrgang >= 7 && meineKurse[i].type == "mathematik") ||
      (meineKurse[i].jahrgang >= 7 && meineKurse[i].type == "englisch")
    ) {
      dropdown += `<a class="dropdown-item" href="/kurs/${
        meineKurse[i].id
      }"><span><i class="pull-right fas fa-caret-right"></i> ${
        kursName
      } ${meineKurse[i].jahrgang}-${meineKurse[i].leistungsebene.toUpperCase()}</span></a>`;
    } else {
      dropdown += `<a class="dropdown-item" href="/kurs/${
        meineKurse[i].id
      }"><span><i class="pull-right fas fa-caret-right"></i> ${
        kursName
      } ${meineKurse[i].jahrgang}</span></a>`;
    }
  }
  return new Handlebars.SafeString(dropdown);
};
