var enabled = {};

function htmlToElement(html) {
  var template = document.createElement("div");
  template.innerHTML = html;
  return template;
}

function generateStarbox(id) {
  var inner_html = `<div class="form-row mb-3" id="startbox_${id}_${id}">
     <div class="form-group col-md-8 border mb-0 px-0">
         <div class="input-group">
             <div class="input-group-prepend">
                 <span class="input-group-text no-border">Begründung:</span>
             </div>
             <textarea class="form-control no-border" required="required" type="text" name="kommentar_${id}" id="kommentar_${id}" placeholder="Bitte geben Sie einen Grund für diese Bewertung an..."
                 rows="1"></textarea>
         </div>
     </div>
     `/*<div class="form-group col-md-2 border ml-0 mb-0"></div>
     </div>`*/;

  return htmlToElement(inner_html);
}

function addAdditionalComment(id) {
  if (enabled[id] === undefined) {
    enabled[id] = true;
    document.getElementById("starbox_"+id).appendChild(generateStarbox(id));
  }
}

function removeComment(id) {
    if (enabled[id] !== undefined) {
        enabled[id] = undefined;
        document.getElementById(`startbox_${id}_${id}`).parentNode.removeChild(document.getElementById(`startbox_${id}_${id}`));
      }
}
