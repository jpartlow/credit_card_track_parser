function pretty_print(object) {
  var debug = "{ "
  for (var property in object) {
    if (typeof object[property] != 'function') {
      debug += property + " : " + object[property] + ", " 
    }
  }
  print(debug + "}")
}

function GoldData() {}
GoldData.prototype = {
  dummy_visa_tracks : "%B4111111111111111^LAST/FIRST^15031019999900888000000?;4111111111111111=150310199999888?",
  visa : {
    track1 : "B4111111111111111^LAST/FIRST^15031019999900888000000",
    track2 : "4111111111111111=150310199999888",
    number : "4111111111111111",
    expiration : "1503",
    month: "03",
    year: "2015",
    first_name : "FIRST",
    last_name : "LAST",
    service_code : "101",
    format_code : "B"
  },
  dummy_mastercard_tracks : "%B5555555555554444^LAST/FIRST^14021019999900888000000?;5555555555554444=14021019999988800000?",
  mc : {
    track1 : "B5555555555554444^LAST/FIRST^14021019999900888000000",
    track2 : "5555555555554444=14021019999988800000",
    number : "5555555555554444",
    expiration : "1402",
    month: "02",
    year: "2014",
    first_name : "FIRST",
    last_name : "LAST",
    service_code : "101",
    format_code : "B"
  },
}
var test_state;
var visa;
var mc;

module("cctd_instance", {
  setup: function() {
    test_state = new GoldData()
    visa = new CreditCardTrackData(test_state.dummy_visa_tracks)
    mc = new CreditCardTrackData(test_state.dummy_mastercard_tracks)
  },
})
test("base properties", function() {
  equal(visa.track_data, test_state.dummy_visa_tracks, 'track_data property')
  equal(mc.track_data, test_state.dummy_mastercard_tracks, 'track_data property')
})
test("visa properties", function() {
  equal(visa.track1.raw, test_state.visa.track1, 'visa track1 matches')
  equal(visa.track2.raw, test_state.visa.track2, 'visa track2 matches')
  equal(visa.number, test_state.visa.number, 'visa card number matches')
  equal(visa.expiration, test_state.visa.expiration, 'visa expiration matches')
  equal(visa.month(), test_state.visa.month, 'visa expiration matches')
  equal(visa.year(), test_state.visa.year, 'visa expiration matches')
  equal(visa.first_name, test_state.visa.first_name, 'visa first_name matches')
  equal(visa.last_name, test_state.visa.last_name, 'visa last_name matches')
})
test("mastercard properties", function() {
  equal(mc.track1.raw, test_state.mc.track1, 'mc track1 matches')
  equal(mc.track2.raw, test_state.mc.track2, 'mc track2 matches')
  equal(mc.number, test_state.mc.number, 'mc card number matches')
  equal(mc.expiration, test_state.mc.expiration, 'mc expiration matches')
  equal(mc.month(), test_state.mc.month, 'mc expiration matches')
  equal(mc.year(), test_state.mc.year, 'mc expiration matches')
  equal(mc.first_name, test_state.mc.first_name, 'mc first_name matches')
  equal(mc.last_name, test_state.mc.last_name, 'mc last_name matches')
})
test("validity", function() {
  ok(visa.is_valid(), "visa is valid")
  equal(visa.errors.count(), 0, "error count")
  ok(mc.is_valid(), "mc is valid")
})
test("minimally valid", function() {
  ok(visa.is_minimally_valid(), "visa is minimally valid")
})
test("unparseable data", function() {
  raises(function() { new CreditCardTrackData('foo') }, "CCTD:NotACreditCard")
})
test("month and year when no expiration", function() {
//  var cctd = new CreditCardTrackData("%B4111111111111111^LAST/FIRST^1019999900888000000?;4111111111111111=10199999888?")
//  ok(!cctd.expiration)
  visa.expiration = null
  equal(null, visa.month())
  equal(null, visa.year())
  visa.expiration = ''
  equal(null, visa.month())
  equal(null, visa.year())
})

module("invalid instance", {
  setup : function() {
    test_state = new GoldData()
    test_state.dummy_visa_tracks = "%B2222211111111111^LAST/^15039999900888000000?;4111111111111111=150310199999888?"
  },
})
test("invalid", function() {
  var visa = new CreditCardTrackData(test_state.dummy_visa_tracks)
  ok(!visa.is_valid(), "visa is not valid")
  deepEqual(visa.errors.messages(), { 'first_name' : ['was not found'], 'number' : ['differs between tracks one and two'], 'service_code' : ['differs between tracks one and two'] }, "visa error messages")
})

module("minimally valid instance", {
  setup : function() {
    test_state = new GoldData()
    test_state.dummy_visa_tracks = "%B4111111111111111^/^1503110?;4111111111111111=150310199999888?"
  }
})
test("minimally valid", function() {
  var visa = new CreditCardTrackData(test_state.dummy_visa_tracks)
  ok(visa.is_minimally_valid(), "visa is minimally valid")
  ok(!visa.is_valid(), "visa is not valid")
  deepEqual(visa.errors.messages(), { 'first_name' : ['was not found'], 'last_name' : ['was not found'], 'service_code' : ['differs between tracks one and two'] }, "visa error messages")
})
