// From http://twoguysarguing.wordpress.com/2010/11/02/make-javascript-tests-part-of-your-build-qunit-rhino/
load("test/qunit.js");
 
QUnit.init();
QUnit.config.blocking = false;
QUnit.config.autorun = true;
QUnit.config.updateRate = 0;
QUnit.log = function(result, message) {
    print(result ? 'PASS' : 'FAIL', message);
};
 
load("lib/credit_card_track_parser.js");
load("test/test.js");
