/** 
 * 12-22-2016
 * ~~ Scott Johnson
 */

/** List jshint ignore directives here. **/
/* jslint node: true */
/* jshint esversion: 6 */
/*eslint-env es6*/


// Stop jshint from complaining about the promise.catch() syntax.
/* jslint -W024 */

var util = require( './lib/bob-util.js' );
var Batch = require( './lib/bob-batch.js' );
var bob = module.exports = generate();

/**
 * Creates a new "instance" of bob.
 */
function generate() {
    var self = Batch();

    self.generate = generate;

    self.log = function(){
        return util.log.apply( this, arguments );
    };// /log()

    self.watch = function(){
        return util.watch.apply( this, arguments );
    };// /watch()

    return self;
}// /generate()