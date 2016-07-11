import EventEmitter from 'eventemitter2'
import chalk from 'chalk'
import table from 'text-table'
import gps from 'wifi-location'
import stripansi from 'strip-ansi'
const pkg  = require('../package')
const geo  = require('node-geocoder')('google', 'http')
const uber = require('uber-api')(pkg.uber)
class Surger {
  constructor(options=Object.create(null)) {
    this.options = options
    this.estimates = []
    this.emitter = new EventEmitter({ wildcard: true })
    this.options.debug && this.emitter.on('debug.*', function(title, ...message) {
      console.warn(chalk.red.bold(this.event), chalk.green.bold(title), ...message)
    })
    this.getCoords(::this.handleCoords)
  }

  isNonEmptyObject(obj) {
    return Object.getOwnPropertyNames(obj || Object.create(null)).length !== 0
  }

  flatten(arr) {
    return arr.reduce((i, chunk) => i.concat(chunk))
  }

  handleCoords(err, { lat = 0, lng = 0 }) {
    if (err) throw (err)
    if (!lat || !lng) throw Error(chalk.dim.red('Unable to get coordinates.'))
    this.emitter.emit('debug.handleCoords', 'location confirmed from `getCoords`')
    this.getDetailsFromLatLng(::this.handleDetails, lat, lng)
    this.getPriceEstimateFromLatLng(::this.handlePriceEstimate, lat, lng)
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
      if (err) return cb(err)
      cb(null, res)
    }))
  }

  getPriceEstimateFromLatLng(cb, lat, lng) {
    const yay = chalk.dim.bgGreen.bold
    const nay = chalk.white.bgRed.bold
    this.emitter.emit('debug.getPriceEstimateFromLatLng', 'getting estimate')
    uber.getPriceEstimate({ sLat: lat, sLng: lng, eLat: lat, eLng: lng }, (err, resp) => {
      if (err) return cb(err)
      this.estimates = resp.prices.map((type) => {
        let good = yay(` ✔ GOOD `)
        let bad  = nay(` $ SURGE ${type.surge_multiplier}x [min. ${type.estimate}]`)
        return [
          type.localized_display_name,             // UberX, UberT, etc.
          type.surge_multiplier === 1 ? good : bad // Surge Pricing?
        ]
      })
      this.emitter.emit('debug.estimates', 'estimates', JSON.stringify(this.estimates.map(a => a.map(stripansi))))
      cb(null, this.estimates)
    })
  }

  getCoords(cb) {
    this.emitter.emit('debug.getCoords', 'finding towers')
    gps.getTowers((err, towers) => {
      if (err) return cb(err)
      this.emitter.emit('debug.getCoords', `found ${towers.length} tower(s)`)
      this.emitter.emit('debug.getTowers', 'err', err)
      this.emitter.emit('debug.getTowers', 'towers', JSON.stringify(towers))
      this.emitter.emit('debug.getCoords', 'finding location')
      gps.getLocation(towers, (err, location) => {
        if (err) return cb(err)
        if (!this.isNonEmptyObject(location)) return cb(Error(chalk.dim.red('Briefly unable to locate you. Try again.')))
        let { latitude = 0, longitude = 0 } = location
        let coords = { lat: latitude, lng: longitude }
        this.emitter.emit('debug.getLocation', 'err', err)
        this.emitter.emit('debug.getLocation', 'location', JSON.stringify(location))
        this.emitter.emit('debug.getCoords', 'confirming location')
        cb(null, coords)
      })
    })
  }
}

export function init(options) {
  return new Surger(options)
}
