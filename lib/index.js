'use strict';

const chalk = require('chalk');
const table = require('text-table');
const gps   = require('wifi-location');
const pkg   = require('./package');

const uber  = require('uber-api')(pkg.uber);

const yay = chalk.dim.bgGreen.bold;
const nay = chalk.white.bgRed.bold;
 
module.exports = new class Surge {
  constructor() {
    this.estimates = [];
    this.getCoords(this.handleCoords.bind(this));
  }

  handleCoords(err, data) {
    if (err && typeof data !== 'object') throw Error(err);
    let { lat, lng } = data;
    this.getPriceEstimateFromLatLng(this.handlePriceEstimate.bind(this), lat, lng);
  }

  handlePriceEstimate(err, estimates) {
    if (err) throw Error(err);
    this.parseEstimates(estimates);
  }

  parseEstimates(estimates) {
    if (!estimates) throw Error('Cannot get estimates :(...');
    console.log(table(estimates));
  }

  getPriceEstimateFromLatLng(cb, lat, lng) {
    uber.getPriceEstimate(lat, lng, lat, lng).then((response) => {
      this.estimates = response.prices.map((type) => {
        let good = yay(' ✔ GOOD ');
        let bad  = nay(' $ SURGE', chalk.white.bgRed(type.surge_multiplier + 'x '));
        return [
          type.localized_display_name,             // UberX, UberT, etc.
          type.surge_multiplier === 1 ? good : bad // Surge Pricing?
        ];
      });
      cb(null, this.estimates);
    }, (err) => {
      cb(err);
    });
  }

  getCoords(cb) {
    gps.getTowers((err, towers) => {
      if (err && typeof towers !== 'object') return cb(err);
      gps.getLocation(towers, (err, loc) => {
        if (err && typeof loc !== 'object') return cb(err);
        let { latitude, longitude } = loc;
        let coords = { lat: latitude, lng: longitude };
        cb(null, coords);
      });
    });
  }
}
