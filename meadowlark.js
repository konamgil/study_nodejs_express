var express = require('express');
var app = express();
var fortune = require("./lib/fortune")

var handlebars = require("express-handlebars").create({
    defaultLayout:'main'
});
// set up handlebars view engine
app.engine('handlebars', handlebars.engine);
app.set('view engine','handlebars');

//port setting
app.set('port', process.env.PORT || 3000);

//정적파일 미들웨어
app.use(express.static(__dirname + '/public'));

// set 'showTests' context property if the querystring contains test=1
app.use(function(req, res, next) {
    res.locals.showTests = app.get('env') !== 'production' &&
      req.query.test === '1';
    console.log("request : " + req.locals);
    next();
});

app.get('/', function (req, res) {
    // handlebars을 사용전
    // res.type('text/plain');
    // res.send('Meadowlark Travel');
    
    res.render('home');
});
app.get('/about', function(req, res) {
    // res.type('text/plain');
    // res.send('About Meadowlark Travel')
    res.render('about', { 
        fortune : fortune.getFortune()
    });
});
// 404 폴백 핸들러 (미들웨어)
app.use(function (req, res, next) {
    // res.type('text/plain');
    res.status(404);
    res.render('404');
    // res.send('404 - Not Found');
});

// 커스텀 500 페이지
app.use(function(err, req, res, next) {
   console.error(err.stack);
//   res.type('text/plain');
   res.status(500);
   res.render('500');
//   res.send('500 - Server Error');
});

app.listen(app.get('port'), function () {
   console.log( 'Express started on http://localhost:' +
   app.get('port') + '; press Ctrl + C to terminate');
});

