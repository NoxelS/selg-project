var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'SELG.report.service@gmail.com',
      pass: 'iKRKXZGDwgVEKHWofKsKDADwHCYCAiuWEjzhkhRdTbWgibtTSKIPjtkRrWNcPsEccjLqicOofHQlfrKdnLdtwtnvphwczIhOLjPD'
    }
  });
  
/* GET login page. */

router.get('/', function(req, res, next) {
    console.log(req.body.error);
    res.redirect('/');
    res.redirect('/login');
});

router.post('/', function(req, res, next) {
    console.log(req.body.error);
    res.redirect('/');

  transporter.sendMail({
      from: 'SELG.report.service@gmail.com',
      to: 'noel@schwabenland.ch',
      subject: 'ERROR Report Recived',
      text: JSON.stringify(req.body.error)
    }, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log("REPORTEMAIL SENT: "+JSON.stringify(info.response));
      }
     });
});

module.exports = router;
