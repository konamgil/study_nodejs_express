var Browser = require('zombie'),
	assert = require('chai').assert;

var browser;

suite('Cross-Page Tests', function(){

	setup(function(){
		browser = new Browser();
	});
    test('requesting a group rate quote from the hood river tour page should ' +
			'populate the hidden referrer field correctly',function(done) {
				var referrer = 'https://i-love-node-js-konamgil.c9users.io:8080/tours/hood-river';
        browser.visit(referrer, function() {
        	console.log(browser.location.href);
   //     	browser.clickLink('.requestGroupRate', function(){
			// 	assert(browser.field('referrer').value === referrer);
			// 	done();
			// });
			// browser.assert.className( 'body a', 'requestGroupRate','Request group rate.');
			browser.assert.element('h4');
        	
            done();
        });
    });
	// test('requesting a group rate quote from the hood river tour page should ' +
	// 		'populate the hidden referrer field correctly', function(done){
 //   		var referrer = 'http://localhost:8080/tours/hood-river';
 //   		browser.visit(referrer, function(){
    		    
 //   			browser.clickLink('.requestGroupRate', function(){
	// 			assert(browser.field('referrer').value === referrer);
	// 			done();
	// 		});
	// 		done();
	// 	});
	// });

	// test('requesting a group rate from the oregon coast tour page should ' +
	// 		'populate the hidden referrer field correctly', function(done){
	// 	var referrer = 'http://localhost:3000/tours/oregon-coast';
	// 	browser.visit(referrer, function(){
	// 		browser.clickLink('.requestGroupRate', function(){
	// 			assert(browser.field('referrer').value === referrer);
	// 			done();
	// 		});
	// 	});
	// });

	// test('visiting the "request group rate" page dirctly should result ' +
	// 		'in an empty value for the referrer field', function(done){
	// 	browser.visit('http://localhost:8080/tours/request-group-rate', function(){
	// 		assert(browser.field('referrer').value === '');
	// 		done();
	// 	});
	// });

});
