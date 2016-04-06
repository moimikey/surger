# surger
[![Version][npm-version-image]][npm-version-url] [![License][npm-license-image]][npm-license-url] [![Downloads][npm-downloads-image]][npm-downloads-url] [![Deps][npm-deps-image]][npm-deps-url] [![DevDeps][npm-devdeps-image]][npm-devdeps-url]

## about
Is there surge pricing around me right now? This little CLI utility will determine your location (currently OS X only) using location services and determine if surge pricing is active within your range.

## installation
```
$ npm -g install surger
$ surger

Location:   Nearby East 2nd Street

uberX       ✔ GOOD
uberXL      ✔ GOOD
UberBLACK   $ SURGE 2.8x
UberSUV     $ SURGE 2.8x
uberT       ✔ GOOD
```

> yaaaasss queen yaaaaasssss

# debug
```
$ surger --debug                                                                      !2882
debug.getCoords finding towers
debug.getCoords found 2 tower(s)
debug.getTowers err null
debug.getTowers towers [{"mac":"41:5f:32:5c:61:7c","ssid":"FiOS-02JG1","signal_level":"-90"},{"mac":"00:27:62:a4:14:81","ssid":"ARC","signal_level":"-62"}]
debug.getCoords finding location
debug.getLocation err null
debug.getLocation location {"accuracy":30,"latitude":31.0206837,"longitude":-76.02599699999999}
debug.getCoords confirming location
debug.handleCoords location confirmed from `getCoords`
debug.getPriceEstimateFromLatLng getting estimate

Location:  Nearby Strout Street

debug.estimates estimates [["uberX"," ✔ GOOD "],["uberXL"," ✔ GOOD "],["uberX + Car Seat"," ✔ GOOD "],["UberBLACK"," ✔ GOOD "],["UberSUV"," ✔ GOOD "],["BLACK CAR + Car Seat"," ✔ GOOD "],["SUV + Car Seat"," ✔ GOOD "]]
uberX                  ✔ GOOD
uberXL                 ✔ GOOD
uberX + Car Seat       ✔ GOOD
UberBLACK              ✔ GOOD
UberSUV                ✔ GOOD
BLACK CAR + Car Seat   ✔ GOOD
SUV + Car Seat         ✔ GOOD
```

[npm-version-url]: https://www.npmjs.com/package/surger
[npm-version-image]: https://img.shields.io/npm/v/surger.svg
[npm-license-url]: https://github.com/moimikey/surger/blob/master/LICENSE
[npm-license-image]: https://img.shields.io/npm/l/surger.svg
[npm-downloads-url]: https://www.npmjs.com/package/surger
[npm-downloads-image]: https://img.shields.io/npm/dm/surger.svg
[npm-deps-url]: https://david-dm.org/moimikey/surger
[npm-deps-image]: https://img.shields.io/david/moimikey/surger.svg
[npm-devdeps-url]: https://david-dm.org/moimikey/surger
[npm-devdeps-image]: https://img.shields.io/david/dev/moimikey/surger.svg
