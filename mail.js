var nodemailer = require("nodemailer");
var credentials = require('./credentials.js');

var mailTransport = nodemailer.createTransport('SMTP',{
    service:'Gmail',
    // host:'smtp.meadowlarktravel.com',
    // secureConnection: true,
    // port: 465,
    auth: {
        user: credentials.gmail.user,
        pass: credentials.gmail.password,
    }
});

mailTransport.sendMail({
    from: '"Meadowlark Travel" <info@meadowlarktravel.com>',
    to: 'rhskarlf6461@gmail.com',
    subject:'Your Meadowlark Travel Tour',
    html:'<h1>Meadowlark Travel</h1>\n<p>Thanks for book your trip with '
    + 'Meadowlark Travel. <b>We look forward to your visit!</b>',
    text: 'Thank you for booking your trip with Meadowlark Travel.  ' +
    'we look forward to your visit!',
    generateTextFromHtml: false,
}, function(err, info){
   if(err){
       return console.log( 'Unable to send email: ' + err );
   } 
   console.log('Message sent: ' + info.response);
});