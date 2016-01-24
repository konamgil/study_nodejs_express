/*jshint curly:true, debug:true */

var express = require('express');
var app = express();
var fortune = require("./lib/fortune");
var formidable = require("formidable");

var handlebars = require("express-handlebars").create({
    defaultLayout:'main',
    helpers: {
        section: function(name, options){
            if(!this._sections){ this._sections = {};}
            this._sections[name] = options.fn(this);
            return null;
        }
    }
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
app.use(require('body-parser').urlencoded({ extended: true}));



//mocked weather data
function getWeatherData() {
    return {
        locations :[
            {
                name: 'Portland',
                forecastUrl: 'http://www.wunderground.com/US/OR/Portland.html',
                iconUrl : 'http://icons-ak.wxug.com/i/c/k/cloudy.gif',
                weather : 'Overcast',
                temp : '54.1 F (12.3 C)',
            },
            {
                name: 'Bend',
                forecastUrl: 'http://www.wunderground.com/US/OR/Bend.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/partlycloudy.gif',
                weather: 'Partly Cloudy',
                temp: '55.0 F (12.8 C)',
            },
            {
                name: 'Manzanita',
                forecastUrl: 'http://www.wunderground.com/US/OR/Manzanita.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/rain.gif',
                weather: 'Light Rain',
                temp: '55.0 F (12.8 C)',
            },
        ],
    };
}
app.use(function(req, res, next) {
   if(!res.locals.partials){ res.locals.partials = {};}
    res.locals.partials.weatherContext = getWeatherData();
   next();
});

var cb0 = function (req, res, next) {
  console.log('CB0');
  next();
};

var cb1 = function (req, res, next) {
  console.log('CB1');
  next();
};

var cb2 = function (req, res) {
  res.send('Hello from C!');
};

app.get('/example/c', [cb0, cb1, cb2]);




//----------routing 관리
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
app.get('/tours/oregon-coast', function(req, res){
	res.render('tours/oregon-coast');
});
app.get('/tours/request-group-rate', function(req, res){
	res.render('tours/request-group-rate');
});
app.get('/nursery-rhyme', function(req, res) {
    res.render('nursery-rhyme');
});
app.get('/data/nursery-rhymem', function(req, res) {
   res.json({
     animal: 'squirrel',
     bodyPart: 'tail',
     adjective: 'bushy',
     noun: 'heck',
   });
});
app.get('/thank-you', function(req, res){
	res.render('thank-you');
});
app.get('/newsletter', function(req, res){
    // we will learn about CSRF later...for now, we just
    // provide a dummy value
    res.render('newsletter', { csrf: 'CSRF token goes here' });
});
app.post('/process', function(req, res){
    if(req.xhr || req.accepts('json,html')==='json'){
        // if there were an error, we would send { error: 'error description' }
        res.send({ success: true });
    } else {
        // if there were an error, we would redirect to an error page
        res.redirect(303, '/thank-you');
    }
});


app.get('/contest/vacation-photo',function(req, res) {
    var now = new Date();
    res.render('contest/vacation-photo',{
        year: now.getFullYear(), month: now.getMonth()
    });
});

app.post('/contest/vacation-photo/:year/:month', function(req, res) {
   var form = new formidable.IncomingForm();
   form.parse(req, function (err, fields, files) {
       if(err){ return res.redirect(303, '/error');}
       console.log('received fields:');
       console.log(fields);
       console.log('received files:');
       console.log(files);
       res.redirect(303,'/thank-you');
   });
});
// error page 처리 -----------------

// 404 폴백 핸들러 (미들웨어)
app.use(function (req, res, next) {
    // res.type('text/plain');
    res.status(404);
    res.render('404');
    // res.send('404 - Not Found');
    console.error('404 error');
});

// 커스텀 500 페이지
app.use(function(err, req, res, next) {
   console.error(err.stack);
//   res.type('text/plain');
   res.status(500);
   res.render('500');
//   res.send('500 - Server Error');
    console.error('500 error');
    
});

app.listen(app.get('port'), function () {
   console.log( 'Express started on http://localhost:' +
   app.get('port') + '; press Ctrl + C to terminate');
});

