'use strict';

const nodemailer = require('nodemailer');

function generateUUID() {
  var d = new Date().getTime();
  var uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (d + Math.random()*16)%16 | 0;
    d = Math.floor(d/16);
    return (c === 'x' ? r : (r&0x3|0x8)).toString(16);
  });
  return uuid;
}

function sendEmail(to, uuid) {

  // create reusable transporter object using the default SMTP transport
  var transporter = nodemailer.createTransport('smtps://postmaster%40collabncode.com:2c109e26f3c1d4293ca2e84f344d03e5@smtp.mailgun.org');

  // setup e-mail data with unicode symbols
  var mailOptions = {
    from: '"CodeShare Verification"', // sender address
    to: to, // list of receivers
    subject: 'Verify your email for CodeShare', // Subject line
    text: 'Welcome to CodeShare \n\nBefore you can use our service you need to active your account. Please click on this link to active your email: www.collabncode.com/verify/' + uuid, // plaintext body
    html: 'Welcome to CodeShare <br /><br />Before you can use our service you need to active your account. Please click on this link to active your email: <a href="www.collabncode.com/verify/' + uuid + '">www.collabncode.com/verify/' + uuid + '</a>'// html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, function(error, info){
    if(error){
      return console.log(error);
    }
    console.log('Message sent: ' + info.response);
  });
}

module.exports = {

  generateUUID: generateUUID,
  sendEmail: sendEmail
};
