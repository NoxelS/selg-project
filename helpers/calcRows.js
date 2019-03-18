var Handlebars = require("handlebars");

module.exports = function(text) {
    const lineLength = "AAAABBBBAAAABBBBAAAABBBBAAAABBBBAA".length;
    text = text+"";
    if(text.length >= 3*lineLength) return 4;
    if(text.length >= 2*lineLength) return 3;
    if(text.length >= lineLength) return 2;
    return 1;
};
