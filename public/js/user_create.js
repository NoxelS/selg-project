var enabled = false;

function htmlToElement(html) {
  var template = document.createElement("div");
  template.id ="placeholder_2"
  template.innerHTML = html;
  return template;
}

function generateTutorForm() {
  var inner_html = `
     <div class="form-group" id="tutor_form">
      <label for="klasse">Klasse</label>
      <input type="klasse" class="form-control" name="tutor_klasse" id="tutor_klasse" placeholder="Klasse des Tutors (Bsp. 8b, 7c ... usw.)" required="required">
    </div>

     `/*<div class="form-group col-md-2 border ml-0 mb-0"></div>
     </div>`*/;

  return htmlToElement(inner_html);
}

function addTutorForm() {
  if (!enabled) {
    enabled = true;
    document.getElementById("placeholder").appendChild(generateTutorForm());
  }
}

function removeTutorForm() {
    if (enabled) {
        enabled = false;
        document.getElementById("placeholder_2").removeChild(document.getElementById("tutor_form"));
        document.getElementById("placeholder").removeChild(document.getElementById("placeholder_2"));
      }
}

function changeForm(value){
  if(value === "tutor"){
    addTutorForm();
  }else{
    removeTutorForm();
  }
}