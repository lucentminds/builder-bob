/**
 * 01-23-2017
 * Buildfile.
 * Scott Johnson
 */


/** List jshint ignore directives here. **/
/* jslint node: true */
/* global JSON:false */

// Stop jshint from complaining about the promise.catch() syntax.
/* jslint -W024 */

var bob = require( '../builder-bob' );

var builder = module.exports = function( bob ){

        // Create the "build" job.
        var job = bob.createJob( 'build', function( result, next ){
            if( true ){ 
                throw new Error( 'bork' );
            }

            console.log( 'We cannot get here!' );
            next();
        });

        job.fail(function( err ){
            console.log( '\nFailed to build test!' );
        });
        
        job.done(function(){
            console.log( '\ntest done!' );
        });

    // Always return bob. :)
    return bob;

};// /export()

builder( bob ).getJob( 'build' ).run();