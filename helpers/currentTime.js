var Handlebars = require("handlebars");
var datetime = require("node-datetime");
module.exports = function(fullname) {
  return new Handlebars.SafeString(datetime.create().format("H:M"));
};
