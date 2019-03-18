var Handlebars = require("handlebars");
const db = require("../db");
const Promise = require("promise");

module.exports = function(announcements) {
  if (announcements !== undefined) {
    let dropdown = "";
    for (let i = 0; i < announcements.length; i++) {
      dropdown += `
    <div class="card mt-3" style="width: 35rem; height: auto;">
    <div class="card-header bg-light mb-0">
    <b>${announcements[i].author_name}</b><span class="text-muted"> am ${
        announcements[i].display_date
      }</span>
  </div>
        <div class="card-body">
            <p class="card-text my-0 py-0">${announcements[i].message}</p>
        </div>
    </div>
    `;
    }
  
  return new Handlebars.SafeString(dropdown);
    }else{
        return new Handlebars.SafeString("");
    }
};
