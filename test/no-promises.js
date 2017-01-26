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
            console.log( 'No promises here!' );
            next( 'foo' );
        });

        job.addTask( 'another-task', function( result, next ){
            console.log( result ); // outputs: foo
            next();
        });

        job.addTask( 'complete', function( result, next ){
            console.log( result ); // outputs: undefined
            console.log( 'complete!' );
            next();
        });

    // Always return bob. :)
    return bob;

};// /export()

builder( bob ).getJob( 'build' ).run();