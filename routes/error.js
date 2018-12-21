var express = require("express");
var router = express.Router();
var nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "SELG.report.service@gmail.com",
    pass:
      "iKRKXZGDwgVEKHWofKsKDADwHCYCAiuWEjzhkhRdTbWgibtTSKIPjtkRrWNcPsEccjLqicOofHQlfrKdnLdtwtnvphwczIhOLjPD"
  }
});

/* GET login page. */

router.get("/", function(req, res, next) {
  var handlebars_presettings = {
    layout: res.locals.permission,
    title: "SELG-Tool",
    display_name: res.locals.username,
    icon_cards: false,
    location: "Übersicht"
  };

  res.render("error", handlebars_presettings);
});


router.post("/", function(req, res, next) {
  console.log("Somebody posting an error: " + req.body.error);
  res.redirect("/");

  transporter.sendMail(
    {
      from: "SELG.report.service@gmail.com",
      to: "noel@schwabenland.ch",
      subject: "ERROR Report Recived",
      text: JSON.stringify(req.body.error)
    },
    function(error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("REPORTEMAIL SENT: " + JSON.stringify(info.response));
      }
    }
  );
});

module.exports = router;
