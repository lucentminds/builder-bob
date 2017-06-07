/**
 * 12-22-2016
 * ~~ Scott Johnson
 */

/** List jshint ignore directives here. **/
/* jslint node: true */
/* jshint esversion: 6 */
/* eslint-env es6 */


// Stop jshint from complaining about the promise.catch() syntax.
/* jslint -W024 */

var util = require( './lib/bob-util.js' );
var Batch = require( './lib/bob-batch.js' );

/**
 * Creates a new "instance" of bob.
 */
var bob = function() {
    var self = function(){
        return bob.apply( this, arguments );
    };// /self()

    util.extend( self, Batch.apply( this, arguments ) );

    self.log = function(){
        return util.log.apply( this, arguments );
    };// /log()

    self.watch = function( cWatchPath ){

        // Setup the watcher.
        return util.watch( cWatchPath, function( cPathChanged ){
            // Emit the "change" event.
            self.emit( 'change', self, cPathChanged );
        })
        .then(function(){
            return self;
        });

    };// /watch()

    Batch.prototypes.cwd = function( cCachePath ){
        this._cwd = cCachePath;
    };// /cwd()

    return self;
};// /generateBob()

module.exports = bob();