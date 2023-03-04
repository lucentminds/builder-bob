/**
 * 01-23-2017
 * Buildfile.
 * Scott Johnson
 */


/** List jshint ignore directives here. **/
/* jslint node: true */

// Stop jshint from complaining about the promise.catch() syntax.
/* jslint -W024 */
// var copy = require( 'promise-file-copy' );
// var concat = require( 'promise-file-concat' );
// var read = require( 'promise-file-read' );
// var write = require( 'promise-file-write' );
// var jsify = require( 'promise-file-jsify' );
// var empty = require( 'promise-empty-dir' );

console.log( 'buildfile!' );
var build = module.exports = function( bob ){ // jshint ignore:line

    var oBatch = bob.createBatch( 'main' );
    var oJobBuild = oBatch.createJob( 'build' );

    oJobBuild.addTask( 'task1', {
        enabled: false,
        do: function(){
            return new Promise(( resolve ) => {
                console.log( '\nRunning task1...' );
                setTimeout( resolve(), 3000 );
            });
        }// /do()
    });

    oJobBuild.addTask( 'task2', {
        enabled: true,
        do: function(){
            return new Promise(( resolve ) => {
                console.log( '\nRunning task2...' );
                setTimeout( resolve(), 3000 );
            });
        }// /do()
    });

    oJobBuild.fail(function( err ){
        console.log( '\nFailed to build test!' );
        console.log( err );
        console.log( '\n\n' );
    });
    
    oJobBuild.done(function(){
        console.log( '\ntest done!' );
    });

    oBatch.createJob( 'watch', function(){
        // Run the build task then set up the watcher.
        return oJobBuild.run()
        .then(function(){

            // Setup the watcher.
            return bob.watch( './test', function( cPathChanged ){
                console.log( cPathChanged, '!!!!!' );
                oJobBuild.run();
            });
            
        });
    });

    return oBatch;

};// /build()