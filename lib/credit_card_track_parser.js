// This file is part of credit_card_track_parser.  Copyright 2010 Joshua Partlow.  This program is free software, licensed under the terms of the GNU General Public License.  Please see the LICENSE file in this distribution for more information, or see http://www.gnu.org/copyleft/gpl.html.

var CCTD = {
    Version : "0.1.0"
}

/* TrackErrors()
 * 
 * Constructor for TrackeErrors objects.  A TrackErrors object provides simple
 * mechanics for adding error messages related to different fields, counting the
 * total fields with errors, and retrieving a hash of the messages.
 *
 *   var errors = new TrackErrors()
 *   errors.add('foo', 'is broken')
 *   errors.add('bar', 'is also broken')
 *   errors.add('bar', 'and looks funny')
 *   errors.count() // -> 2
 *   errors.messages() // -> { 'foo' : ['is broken'], 'bar' : ['is also broken', 'and looks funny'] }
 */
function TrackErrors() {
  this.errors = {}
} 
TrackErrors.prototype = {
  add : function(field, message) {
    if (this.errors[field] == undefined) {
      this.errors[field] = []
    }
    this.errors[field].push(message)
  },
 
  count : function() {
    var count = 0
    for (var field in this.errors) {
      count += 1
    }
    return count
  },

  messages : function() {
    return this.errors
  },
}

/* CreditCardTrackData()
 *
 * Constructor for CreditCardTrackData objects.  Takes one argument which should be a string of
 * track data as returned by a card reader (see http://en.wikipedia.org/wiki/Magnetic_stripe_card 
 * for information about the format of track data).
 * 
 * A CreditCardTrackData object can be used to parse a string of card data into strings for:
 * 
 * * format_code
 * * number
 * * expiration
 * * last_name
 * * first_name
 * * service_code
 *
 * It can also check the validity of the track data and parse out month and year from the
 * expiration date.
 *  
 */
function CreditCardTrackData(track_data) {
  this.fields = ['format_code', 'number', 'expiration', 'last_name', 'first_name', 'service_code']
  this.track_data = track_data
  this.parse()
  this.CENTURY = "20"
}
CreditCardTrackData.prototype = {
  parse : function() {
    this.tracks_match_data = this.track_data.match(/^%(.*)\?;(.*)\?$/)
    if (this.tracks_match_data == null) {
      throw("CCTD:NotACreditCard")
    }
    var track1_raw = this.tracks_match_data[1]
    var track2_raw = this.tracks_match_data[2]
    var track1_match_data = track1_raw.match(/^(.)(\d*)\^([^\/]*)\/(.*)\^(.{4})(.{3})(.*)$/)
    if (track1_match_data == null) {
      throw("CCTD:UparseableTrackOne")
    }
    this.track1 = {
      raw : track1_raw,
      match_data : track1_match_data,
      format_code : track1_match_data[1],
      number : track1_match_data[2],
      last_name : track1_match_data[3],
      first_name : track1_match_data[4],
      expiration : track1_match_data[5],
      service_code : track1_match_data[6],
      discretionary : track1_match_data[7],
    }
    var track2_match_data = track2_raw.match(/^(\d*)=(.{4})(.{3})(.*)$/)
    if (track2_match_data == null) {
      throw("CCTD:UparseableTrackTwo")
    }
    this.track2 = {
      raw : track2_raw,
      match_data : track2_match_data,
      number : track2_match_data[1],
      expiration : track2_match_data[2],
      service_code : track2_match_data[3],
      discretionary : track2_match_data[4],
    }
    this.format_code = this.track1.format_code
    this.number = this.track2.number
    this.expiration = this.track2.expiration
    this.last_name = this.track1.last_name
    this.first_name = this.track1.first_name
    this.service_code = this.track2.service_code
  },

  year : function() {
    if (this.expiration) {
      return this.CENTURY + this.expiration.slice(0,2)
    }
  },

  month : function() {
    if (this.expiration) {
      return this.expiration.slice(2,4)
    }
  },

  /* CreditCardTrackData.is_valid()
   * 
   * Calling is_valid() checks that the track data is valid in that it matches the expected format
   * for magnetic stripe card data (provides all the expected fields) and that fields duplicated
   * between tracks one and two match.
   *
   * An errors are held in a TrackErrors object in the CreditDataTrackData.errors property.
   * 
   */
  is_valid : function() {
    this.errors = new TrackErrors()
    for (var i = 0; i < this.fields.length; i += 1) { 
      var field = this.fields[i]
      if (this[field] == undefined || this[field] == '') {
        this.errors.add(field, 'was not found')
      }
    }
    function check_difference(cctd, field) {
      if (cctd.track1[field] != cctd.track2[field]) {
        cctd.errors.add(field, 'differs between tracks one and two')
      }
    }
    check_difference(this, 'number')
    check_difference(this, 'expiration')
    check_difference(this, 'service_code')
    return this.errors.count() == 0
  },

  is_minimally_valid : function() {
    this.is_valid()
    if (this.track1.raw != undefined && this.track1.raw != '' &&
        this.track2.raw != undefined && this.track2.raw != '' &&
        this.errors['number'] == undefined && 
        this.errors['expiration'] == undefined) {
      return true
    }
    return false
  }
}
