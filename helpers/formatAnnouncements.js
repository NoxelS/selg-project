var Handlebars = require("handlebars");

module.exports = function(announcements) {
    // Durch 'reverse' werden die neusten Anlündigungen zuerst angezeigt.
    announcements = announcements.reverse();
    
    if (announcements !== undefined && announcements.length !== 0) {
        let dropdown = "";
        for (let i = 0; i < announcements.length; i++) {
          dropdown += `
                        <a href="#" class="list-group-item list-group-item-action flex-column align-items-start mb-3">
                        <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">Von ${announcements[i].author_name}</h5>
                        <small class="text-gray">#${announcements[i].id}</small>
                        </div>
                        <p class="mb-1">${announcements[i].message}</p>
                        <small>${announcements[i].display_date}</small>
                        </a>
                    `;
    }
        return new Handlebars.SafeString(dropdown);
    }else{
        return new Handlebars.SafeString(`<p class="mb-1">Im Moment gibt es keine neuen Ankündigungen</p>`);
    }
};
