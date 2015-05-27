# shitty-uber
Is there surge pricing around me right now? This little CLI utility will determine your location (currently OS X only) using location services and determine if surge pricing is active within your range.

## notes
this is currently **experimental** and will eventually turn into a node module that you can globally install:

## installation
```
$ cd somewhere
$ git clone https://github.com/moimikey/shitty-uber.git && cd shitty-uber
$ npm install
$ npm run surge

> shitty-uber@0.1.0 surge /Users/mshertzberg/Git/shitty-uber
> babel ./lib/index.js | node

uberX       ✔ GOOD
uberXL      ✔ GOOD
UberBLACK   $ SURGE 2.8x
UberSUV     $ SURGE 2.8x
uberT       ✔ GOOD
```
