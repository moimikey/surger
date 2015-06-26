'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var chalk = require('chalk');
var table = require('text-table');
var gps = require('wifi-location');
var geo = require('node-geocoder')('google', 'http');
var pkg = require('../package');
var uber = require('uber-api')(pkg.uber);
var yay = chalk.dim.bgGreen.bold;
var nay = chalk.white.bgRed.bold;

var Surge = (function () {
  function Surge() {
    _classCallCheck(this, Surge);

    this.estimates = [];
    this.getCoords(this.handleCoords.bind(this));
  }

  _createClass(Surge, [{
    key: 'isNonEmptyObject',
    value: function isNonEmptyObject(obj) {
      return Object.getOwnPropertyNames(obj || {}).length !== 0;
    }
  }, {
    key: 'flatten',
    value: function flatten(arr) {
      return arr.reduce(function (i, chunk) {
        return i.concat(chunk);
      });
    }
  }, {
    key: 'handleCoords',
    value: function handleCoords(err, data) {
      if (err) throw err;
      var lat = data.lat;
      var lng = data.lng;

      this.getDetailsFromLatLng(this.handleDetails.bind(this), lat, lng);
      this.getPriceEstimateFromLatLng(this.handlePriceEstimate.bind(this), lat, lng);
    }
  }, {
    key: 'handlePriceEstimate',
    value: function handlePriceEstimate(err, estimates) {
      if (err) throw err;
      this.parseEstimates(estimates);
    }
  }, {
    key: 'handleDetails',
    value: function handleDetails(err, details) {
      if (err) throw err;
      this.parseDetails(this.flatten(details));
    }
  }, {
    key: 'parseEstimates',
    value: function parseEstimates(estimates) {
      console.log(table(estimates));
    }
  }, {
    key: 'parseDetails',
    value: function parseDetails(details) {
      console.log('');
      console.log('Location:  Nearby', chalk.dim.blue(details.streetName));
      console.log('');
    }
  }, {
    key: 'getDetailsFromLatLng',
    value: function getDetailsFromLatLng(cb, lat, lng) {
      geo.reverse({ lat: lat, lon: lng }, function (err, res) {
        if (err) cb(err);
        cb(null, res);
      });
    }
  }, {
    key: 'getPriceEstimateFromLatLng',
    value: function getPriceEstimateFromLatLng(cb, lat, lng) {
      var _this = this;

      uber.getPriceEstimate({ sLat: lat, sLng: lng, eLat: lat, eLng: lng }, function (err, resp) {
        if (err) return cb(err);
        _this.estimates = resp.prices.map(function (type) {
          var good = yay(' ✔ GOOD ');
          var bad = nay(' $ SURGE', type.surge_multiplier + 'x ');
          return [type.localized_display_name, // UberX, UberT, etc.
          type.surge_multiplier === 1 ? good : bad // Surge Pricing?
          ];
        });
        cb(null, _this.estimates);
      });
    }
  }, {
    key: 'getCoords',
    value: function getCoords(cb) {
      var _this2 = this;

      gps.getTowers(function (err, towers) {
        if (err) return cb(err);
        gps.getLocation(towers, function (err, location) {
          if (err) return cb(err);
          if (!_this2.isNonEmptyObject(location)) return cb(Error(chalk.dim.red('Briefly unable to locate you. Try again.')));
          var latitude = location.latitude;
          var longitude = location.longitude;

          var coords = { lat: latitude, lng: longitude };
          cb(null, coords);
        });
      });
    }
  }]);

  return Surge;
})();

exports['default'] = Surge;
module.exports = exports['default'];