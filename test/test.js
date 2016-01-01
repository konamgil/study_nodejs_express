var mocha = require("mocha");
    expect = require("chai").expect;
    config = require('../config');
    
    describe('test suit1', function() {
        it('should test', function() {
            expect(true).to.be.true;
        });
        it('port num should have a 8080',function() {
            // config.port === process.env.PORT;
        });
        it('staticFolder is src',function() {
            // config.staticFolder === 'src';
        });
    });