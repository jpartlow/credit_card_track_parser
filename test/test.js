test("a basic test example", function() {
  var cc = new CreditCardTrackData('foo')
  equal('foo', cc.track_data, 'track_data property')
});
