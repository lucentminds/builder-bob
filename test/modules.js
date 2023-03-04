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

var glob = require( 'promise-file-glob' );
var resolve = require( 'promise-resolve-path' );
var bob = require( '../builder-bob' );

    
// Use glob to quickly locate all of the sub-module bobfiles.
glob( './test/folder/**/bobfile.js' )

// Resolve all of the paths to absolute paths.
.then( resolve )

// Create your jobs.
.then(function( aResolved ){

    console.log( aResolved );

    // Create the "build" job.
    var buildJob = bob.createJob( 'build' );

    buildJob.addTask( 'build-modules', function(){
        var i, l = aResolved.length;
        var oBatch, aProm = [];

        // Loop over each absolute bobfile path.
        for( i = 0; i < l; i++ ) {

            // Get the module batch object.
            oBatch = require( aResolved[ i ] )( bob() );
            
            // Run the module builder.
            aProm.push( oBatch.getJob( 'build' ).run() );

        }// /for()

        return Promise.all( aProm );
    });
    
    bob.getJob( 'build' ).run();
}).done();
