var Handlebars = require("handlebars");

module.exports = function(fullname) {
  let parseName = fullname[0] + " " + fullname[1].split("")[0]+".";

  return new Handlebars.SafeString(parseName);
};
