var Browser = require("zombie"),
    assert = require("chai").assert;
    
    var browser;
    
    suite('Cross-Page Test', function () {
        
        setup(function () {
            browser = new Browser();
        });
        
        test('requesting a group rate from the hood river tour page' +
                'should populate the referrer field',function (done) {
                    var referrer = 'http://localhostL:3000/tours/hood-river';
                    browser.visit(referrer, function () {
                        browser.clickLink('.requestGroupRate', function () {
                            assert(browser.field('referrer').value === referrer);
                            done();
                        });
                    });
                });
    });