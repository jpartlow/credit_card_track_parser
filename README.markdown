Credit Card Track Data Parser
=============================

This Javscript library is for parsing credit card track data such as might be returned from a USB card reader.  It does not perform validation of the credit card number (such as Luhn checks); there are already many libraries that perform this.

See http://en.wikipedia.org/wiki/Magnetic_stripe_card for information about the format of track data.

Running Tests
=============

[QUnit](http://docs.jquery.com/QUnit) is being used to test the library.

You may run the tests using the Javascript interpreter of your browser by viewing test/tests.html in your browser.

You may also run the tests on the commandline if you have a Javascript interpreter such as SpiderMonkey or Rhino by executing test/commandline_runner.js with your interpretter from the root of the project.
