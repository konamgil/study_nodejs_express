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
    // console.log("request : " + req.locals);
    next();
});

//routing 관리
app.get('/', function (req, res) {
    // handlebars을 사용전
    // res.type('text/plain');
    // res.send('Meadowlark Travel');
    
    res.render('home');
    console.log('url : /');
});
app.get('/about', function(req, res) {
    // res.type('text/plain');
    // res.send('About Meadowlark Travel')
    res.render('about', { 
        fortune : fortune.getFortune(),
        pageTestScript:'/qa/tests-about.js'
    });
    console.log('url : /about');
});

app.get('/tours/hood-river', function(req, res){
	res.render('tours/hood-river');
});
// app.get('/tours/oregon-coast', function(req, res){
// 	res.render('tours/oregon-coast');
// });
app.get('/tours/request-group-rate', function(req, res){
	res.render('tours/request-group-rate');
});
// error page 처리 -----------------

// 404 폴백 핸들러 (미들웨어)
app.use(function (req, res, next) {
    // res.type('text/plain');
    res.status(404);
    res.render('404');
    // res.send('404 - Not Found');
    console.log('404 error');
});

// 커스텀 500 페이지
app.use(function(err, req, res, next) {
   console.error(err.stack);
//   res.type('text/plain');
   res.status(500);
   res.render('500');
//   res.send('500 - Server Error');
    console.log('500 error')
    
});

app.listen(app.get('port'), function () {
   console.log( 'Express started on http://localhost:' +
   app.get('port') + '; press Ctrl + C to terminate');
});

