var selected = 8;
var fach = "deutsch";
function stufeChange(stufe) {
  if (stufe == 5) {
    selected = 5;
    document.getElementById("leistungsebene").innerHtml =
      '<option value="default">default</option>';

    document.getElementById("fach").innerHTML =
      '<option value="deutsch">Deutsch</option>' +
      '<option value="englisch">Englisch</option>' +
      '<option value="mathematik">Mathematik</option>' +
      '<option value="gesellschaftslehre">Gesellschaftslehre</option>' +
      '<option value="musik">Musik</option>' +
      '<option value="bildende Kunst">Bildende Kunst</option>' +
      '<option value="naturwissenschaften">Naturwissenschaften</option>' +
      '<option value="religion">Religion</option>' +
      '<option value="sport">Sport</option>' +
      '<option value="sgl">SGL</option>';
  } else if (stufe == 6) {
    selected = 6;
    document.getElementById("fach").innerHTML =
      '<option value="deutsch">Deutsch</option>' +
      '<option value="englisch">Englisch</option>' +
      '<option value="mathematik">Mathematik</option>' +
      '<option value="gesellschaftslehre">Gesellschaftslehre</option>' +
      '<option value="musik">Musik</option>' +
      '<option value="bildende Kunst">Bildende Kunst</option>' +
      '<option value="naturwissenschaften">Naturwissenschaften</option>' +
      '<option value="religion">Religion</option>' +
      '<option value="sport">Sport</option>' +
      '<option value="sgl">SGL</option>' +
      '<option value="kommunikation_und_medien">WPF: Kommunikation und Medien</option>' +
      '<option value="oekologie">WPF: Ökologie</option>' +
      '<option value="darstellendes_spielen">WPF: Darstellendes Spiel</option>' +
      '<option value="sport_und_gesundheit">WPF: Sport und Gesundheit</option>' +
      '<option value="franzoesisch">WPF: Französisch</option>' +
      '<option value="technik_und_wirtschaft">WPF: Technik und Wirtschaft</option>' +
      '<option value="kunst_und_design">WPF: Kunst und Design</option>';
  } else if (stufe == 7) {
    selected = 7;
    document.getElementById("fach").innerHTML =
      '<option value="deutsch">Deutsch</option>' +
      '<option value="englisch">Englisch</option>' +
      '<option value="mathematik">Mathematik</option>' +
      '<option value="gesellschaftslehre">Gesellschaftslehre</option>' +
      '<option value="musik">Musik</option>' +
      '<option value="bildende Kunst">Bildende Kunst</option>' +
      '<option value="chemie">Chemie</option>' +
      '<option value="physik">Physik</option>' +
      '<option value="religion">Religion</option>' +
      '<option value="sport">Sport</option>' +
      '<option value="sgl">SGL</option>' +
      '<option value="kommunikation_und_medien">WPF: Kommunikation und Medien</option>' +
      '<option value="oekologie">WPF: Ökologie</option>' +
      '<option value="darstellendes_spielen">WPF: Darstellendes Spiel</option>' +
      '<option value="sport_und_gesundheit">WPF: Sport und Gesundheit</option>' +
      '<option value="franzoesisch">WPF: Französisch</option>' +
      '<option value="technik_und_wirtschaft">WPF: Technik und Wirtschaft</option>' +
      '<option value="kunst_und_design">WPF: Kunst und Design</option>';
  } else if (stufe == 8) {
    selected = 8;
    document.getElementById("fach").innerHTML =
      '<option value="deutsch">Deutsch</option>' +
      '<option value="englisch">Englisch</option>' +
      '<option value="mathematik">Mathematik</option>' +
      '<option value="gesellschaftslehre">Gesellschaftslehre</option>' +
      '<option value="musik">Musik</option>' +
      '<option value="bildende Kunst">Bildende Kunst</option>' +
      '<option value="chemie">Chemie</option>' +
      '<option value="biologie">Biologie</option>' +
      '<option value="physik">Physik</option>' +
      '<option value="religion">Religion</option>' +
      '<option value="sport">Sport</option>' +
      '<option value="sgl">SGL</option>' +
      '<option value="kommunikation_und_medien">WPF: Kommunikation und Medien</option>' +
      '<option value="oekologie">WPF: Ökologie</option>' +
      '<option value="darstellendes_spielen">WPF: Darstellendes Spiel</option>' +
      '<option value="sport_und_gesundheit">WPF: Sport und Gesundheit</option>' +
      '<option value="franzoesisch">WPF: Französisch</option>' +
      '<option value="technik_und_wirtschaft">WPF: Technik und Wirtschaft</option>' +
      '<option value="kunst_und_design">WPF: Kunst und Design</option>';
  }

  if (
    (selected >= 7 && fach === "mathematik") ||
    (selected >= 7 && fach === "deutsch") ||
    (selected >= 7 && fach === "englisch")
  ) {
    document.getElementById("leistungsebene").hidden = false;
    document.getElementById("leistungsebene_label").hidden = false;
  } else {
    document.getElementById("leistungsebene").hidden = true;
    document.getElementById("leistungsebene_label").hidden = true;
  }
}

function fachChange(fach) {
  fach = fach;
  if (
    (selected >= 7 && fach === "mathematik") ||
    (selected >= 7 && fach === "deutsch") ||
    (selected >= 7 && fach === "englisch")
  ) {
    document.getElementById("leistungsebene").hidden = false;
    document.getElementById("leistungsebene_label").hidden = false;
  } else {
    document.getElementById("leistungsebene").hidden = true;
    document.getElementById("leistungsebene_label").hidden = true;
  }
}
