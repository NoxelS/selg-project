var express = require("express");
var router = express.Router();
var passport = require('passport');

/* GET Login page. */
router.get("/", function(req, res, next) {
    req.logout();
    req.session.destroy();
    res.redirect('/')
});

module.exports = router;
