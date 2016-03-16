/*jshint curly:true, debug:true */

var express = require('express'),
    fortune = require("./lib/fortune"),
    formidable = require("formidable"),
	jqupload = require('jquery-file-upload-middleware');

var app = express();

var credentials = require('./credentials.js');
var emailService = require('./lib/email.js')(credentials);

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

app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(require('express-session')({
    resave: false,
    saveUninitialized: false,
    secret: credentials.cookieSecret,
}));


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

// flash message middleware
app.use(function(req, res, next){
	// if there's a flash message, transfer
	// it to the context, then clear it
	res.locals.flash = req.session.flash;
	delete req.session.flash;
	next();
});


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

// jQuery File Upload endpoint middleware
app.use('/upload', function(req, res, next){
    var now = Date.now();
    jqupload.fileHandler({
        uploadDir: function(){
            return __dirname + '/public/uploads/' + now;
        },
        uploadUrl: function(){
            return '/uploads/' + now;
        },
    })(req, res, next);
});


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

// for now, we're mocking NewsletterSignup:
function NewsletterSignup(){
}
NewsletterSignup.prototype.save = function(cb){
	cb();
};

var VALID_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

app.post('/newsletter', function(req, res){
	var name = req.body.name || '', email = req.body.email || '';
	// input validation
	if(!email.match(VALID_EMAIL_REGEX)) {
		if(req.xhr) {return res.json({ error: 'Invalid name email address.' });}
		req.session.flash = {
			type: 'danger',
			intro: 'Validation error!',
			message: 'The email address you entered was  not valid.',
		};
		return res.redirect(303, '/newsletter/archive');
	}
	new NewsletterSignup({ name: name, email: email }).save(function(err){
		if(err) {
			if(req.xhr){ return res.json({ error: 'Database error.' });}
			req.session.flash = {
				type: 'danger',
				intro: 'Database error!',
				message: 'There was a database error; please try again later.',
			};
			return res.redirect(303, '/newsletter/archive');
		}
		if(req.xhr){ return res.json({ success: true });}
		req.session.flash = {
			type: 'success',
			intro: 'Thank you!',
			message: 'You have now been signed up for the newsletter.',
		};
		return res.redirect(303, '/newsletter/archive');
	});
});
app.get('/newsletter/archive', function(req, res){
	res.render('newsletter/archive');
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
var cartValidation = require('./lib/cartValidation.js');

app.use(cartValidation.checkWaivers);
app.use(cartValidation.checkGuestCounts);

app.post('/cart/add', function(req, res, next){
	var cart = req.session.cart || (req.session.cart = { items: [] });
	nProduct.findOne({ sku: req.body.sku }, function(err, product){
		if(err){ return next(err);}
		if(!product){ return next(new Error('Unknown product SKU: ' + req.body.sku));}
		cart.items.push({
			product: product,
			guests: req.body.guests || 0,
		});
		res.redirect(303, '/cart');
	});
});
app.get('/cart', function(req, res, next){
	var cart = req.session.cart;
	if(!cart){ next();}
	res.render('cart', { cart: cart });
});
app.get('/cart/checkout', function(req, res, next){
	var cart = req.session.cart;
	if(!cart){ next();}
	res.render('cart-checkout');
});
app.get('/cart/thank-you', function(req, res){
	res.render('cart-thank-you', { cart: req.session.cart });
});
app.get('/email/cart/thank-you', function(req, res){
	res.render('email/cart-thank-you', { cart: req.session.cart, layout: null });
});
app.post('/cart/checkout', function(req, res) {
    var cart = req.session.cart;
	if(!cart){
	    next(new Error('Cart does not exist.'));
	}
	var name = req.body.name || '', email = req.body.email || '';
	// input validation
	if(!email.match(VALID_EMAIL_REGEX)){ return res.next(new Error('Invalid email address.'));}
	// assign a random cart ID; normally we would use a database ID here
	cart.number = Math.random().toString().replace(/^0\.0*/, '');
	cart.billing = {
		name: name,
		email: email,
	};
    res.render('email/cart-thank-you', 
    	{ layout: null, cart: cart }, function(err,html){
	        if( err ){ console.log('error in email template');}
	        emailService.send(cart.billing.email,
	        	'Thank you for booking your trip with Meadowlark Travel!',
	        	html);
	    }
    );
    res.render('cart-thank-you', { cart: cart });
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

// app.listen(app.get('port'), function () {
//   console.log( 'Express started on http://localhost:' +
//   app.get('port') + '; press Ctrl + C to terminate');
// });

function startServer() {
    app.listen(app.get('port'), function(){
        console.log('Express started in ' + app.get('env') + 
        ' mode on http://localhost:' + app.get('port') + 
        '; press Ctrl-c to terminate.');
    });
}
if(require.main === module){
    // 애플리케이션은 앱 서버를 시동해 직접 실행됩니다.
    startServer();
}else{
    //require를 통해 애플리케이션을 모듈처럼 가져옵니다.
    // 함수를 반환해서 ㅂ서버를 생성합니다.
    module.exports = startServerL;
}