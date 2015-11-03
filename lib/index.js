'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _textTable = require('text-table');

var _textTable2 = _interopRequireDefault(_textTable);

var _wifiLocation = require('wifi-location');

var _wifiLocation2 = _interopRequireDefault(_wifiLocation);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var geo = require('node-geocoder')('google', 'http');
var pkg = require('../package');
var uber = require('uber-api')(pkg.uber);

var yay = _chalk2.default.dim.bgGreen.bold;
var nay = _chalk2.default.white.bgRed.bold;

exports.default = new ((function () {
  function Surge() {
    _classCallCheck(this, Surge);

    this.estimates = [];
    this.getCoords(this.handleCoords.bind(this));
  }

  _createClass(Surge, [{
    key: 'isNonEmptyObject',
    value: function isNonEmptyObject(obj) {
      return Object.getOwnPropertyNames(obj || Object.create(null)).length !== 0;
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
      console.log((0, _textTable2.default)(estimates));
    }
  }, {
    key: 'parseDetails',
    value: function parseDetails(details) {
      console.log('');
      console.log('Location:  Nearby', _chalk2.default.dim.blue(details.streetName));
      console.log('');
    }
  }, {
    key: 'getDetailsFromLatLng',
    value: function getDetailsFromLatLng(cb, lat, lng) {
      geo.reverse({ lat: lat, lon: lng }, function (err, res) {
        if (err) return cb(err);
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
          var bad = nay(' $ SURGE ' + type.surge_multiplier + 'x [min. ' + type.estimate + ']');
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

      _wifiLocation2.default.getTowers(function (err, towers) {
        if (err) return cb(err);
        _wifiLocation2.default.getLocation(towers, function (err, location) {
          if (err) return cb(err);
          if (!_this2.isNonEmptyObject(location)) return cb(Error(_chalk2.default.dim.red('Briefly unable to locate you. Try again.')));
          var latitude = location.latitude;
          var longitude = location.longitude;

          var coords = { lat: latitude, lng: longitude };
          cb(null, coords);
        });
      });
    }
  }]);

  return Surge;
})())();