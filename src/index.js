'use strict'

const chalk = require('chalk')
const table = require('text-table')
const gps   = require('wifi-location')
const geo   = require('node-geocoder')('google', 'http')
const pkg   = require('../package')
const uber  = require('uber-api')(pkg.uber)
const yay   = chalk.dim.bgGreen.bold
const nay   = chalk.white.bgRed.bold

export default class Surge {
  constructor() {
    this.estimates = []
    this.getCoords(this.handleCoords.bind(this))
  }

  isNonEmptyObject(obj) {
    return Object.getOwnPropertyNames(obj || {}).length !== 0
  }

  flatten(arr) {
    return arr.reduce((i, chunk) => {
      return i.concat(chunk)
    })
  }

  handleCoords(err, data) {
    if (err) throw (err)
    let { lat, lng } = data
    this.getDetailsFromLatLng(this.handleDetails.bind(this), lat, lng)
    this.getPriceEstimateFromLatLng(this.handlePriceEstimate.bind(this), lat, lng)
  }

  handlePriceEstimate(err, estimates) {
    if (err) throw (err)
    this.parseEstimates(estimates)
  }

  handleDetails(err, details) {
    if (err) throw (err)
    this.parseDetails(this.flatten(details))
  }

  parseEstimates(estimates) {
    console.log(table(estimates))
  }

  parseDetails(details) {
    console.log('')
    console.log('Location:  Nearby', chalk.dim.blue(details.streetName))
    console.log('')
  }

  getDetailsFromLatLng(cb, lat, lng) {
    geo.reverse({ lat: lat, lon: lng }, ((err, res) => {
      if (err) cb(err)
      cb(null, res)
    }))
  }

  getPriceEstimateFromLatLng(cb, lat, lng) {
    uber.getPriceEstimate({ sLat: lat, sLng: lng, eLat: lat, eLng: lng }, (err, resp) => {
      if (err) return cb(err)
      this.estimates = resp.prices.map((type) => {
        let good = yay(' ✔ GOOD ')
        let bad  = nay(' $ SURGE', chalk.white.bgRed(type.surge_multiplier + 'x '))
        return [
          type.localized_display_name,             // UberX, UberT, etc.
          type.surge_multiplier === 1 ? good : bad // Surge Pricing?
        ]
      })
      cb(null, this.estimates)
    })
  }

  getCoords(cb) {
    gps.getTowers((err, towers) => {
      if (err) return cb(err)
      gps.getLocation(towers, (err, location) => {
        if (err) return cb(err)
        if (!this.isNonEmptyObject(location)) return cb(Error(chalk.dim.red('Briefly unable to locate you. Try again.')))
        let { latitude, longitude } = location
        let coords = { lat: latitude, lng: longitude }
        cb(null, coords)
      })
    })
  }
}
