import * as util from 'util'
import EventEmitter from 'eventemitter2'
import chalk from 'chalk'
import table from 'text-table'
import gps from 'current-location'
import stripansi from 'strip-ansi'

const pkg = require('../package')
const uber = new (require('node-uber'))(pkg.uber)
const geo = require('node-geocoder')(pkg.geo)

class Surger {
  constructor(options = {}) {
    this.options = options
    this.estimates = []
    this.emitter = new EventEmitter({ wildcard: true })
    this.options.debug && this.emitter.on('debug.*', function(title, ...message) {
      console.warn(chalk.red.bold(this.event), chalk.magenta(title), ...message)
    })
    this.getCoords(this.handleCoords).catch(err => {
      this.emitter.emit('debug.surger', 'getCoords failed', err)
      console.error(err)
    });
  }

  isNonEmptyObject = (obj) => {
    return Object.getOwnPropertyNames(obj || {}).length !== 0
  }

  handleCoords = ({ lat, lng }) => {
    return this.getDetailsFromLatLng(lat, lng).then(() => {
      return this.getPriceEstimateFromLatLng(lat, lng).catch((err) => {
        this.emitter.emit('debug.handleCoords', 'getPriceEstimateFromLatLng failed', err)
        throw err
      })
    })
    .catch(err => {
      this.emitter.emit('debug.handleCoords', 'getDetailsFromLatLng failed', err)
      throw err
    })
  }

  handlePriceEstimate = (err, estimates) => {
    if (err) throw (err)
    this.parseEstimates(estimates)
  }

  parseEstimates = (estimates) => {
    console.log(table(estimates))
  }

  parseDetails = (details) => {
    const { streetName } = details.find(Object)
    console.log('')
    console.log('Estimates near', chalk.blue(streetName))
    console.log('')
  }

  getDetailsFromLatLng = (lat, lng) => {
    this.emitter.emit('debug.getDetailsFromLatLng', 'geo reversing', lat, lng)
    return geo.reverse({ lat: lat, lon: lng }).then(details => this.parseDetails(details))
  }

  getPriceEstimateFromLatLng = (lat, lng) => {
    const yay = chalk.dim.bgGreen.bold
    const nay = chalk.white.bgRed.bold
    this.emitter.emit('debug.getPriceEstimateFromLatLng', 'getting estimates')
    return uber.estimates.getPriceForRouteAsync(lat, lng, lat, lng).then(resp => {
      this.estimates = resp.prices.map(resp => {
        this.emitter.emit('debug.getPriceEstimateFromLatLng', 'getPriceForRouteAsync', JSON.stringify(resp))
        const {
          currency_code,
          display_name,
          distance,
          duration,
          estimate,
          high_estimate,
          localized_display_name,
          low_estimate,
          product_id,
          surge_multiplier = 1,
        } = resp
        return [
          // UberX, UberT, etc.
          localized_display_name,
          // Surge Pricing?
          surge_multiplier === 1
            ? yay(` ✔ GOOD [min. ${low_estimate} ${currency_code}]`)
            : nay(` $ SURGE ${surge_multiplier}x [min. ${estimate} ${currency_code}]`)
        ]
      })
      this.emitter.emit('debug.estimates', 'estimates', JSON.stringify(this.estimates.map(a => a.map(stripansi))))
      this.parseEstimates(this.estimates)
    })
    .error(err => {
      this.emitter.emit('debug.getPriceEstimateFromLatLng', 'getting estimate failed')
      throw err
    })
  }

  getCoords = (cb) => {
    const gpsP = util.promisify(gps)
    this.emitter.emit('debug.getCoords', 'finding location')
    return gpsP().then(location => {
      let { latitude, longitude } = location || {}
      this.emitter.emit('debug.getCoords', 'confirmed location', Object.values(location))
      return cb({ lat: latitude, lng: longitude })
    })
  }
}

export function init(options) {
  return new Surger(options)
}
