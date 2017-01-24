/**
 * 01-23-2017
 * Buildfile.
 * Scott Johnson
 */


/** List jshint ignore directives here. **/
/* jslint node: true */

// Stop jshint from complaining about the promise.catch() syntax.
/* jslint -W024 */
var Q = require( 'q' );
// var copy = require( 'promise-file-copy' );
// var concat = require( 'promise-file-concat' );
// var read = require( 'promise-file-read' );
// var write = require( 'promise-file-write' );
// var jsify = require( 'promise-file-jsify' );
// var empty = require( 'promise-empty-dir' );

console.log( 'buildfile!' );
var build = module.exports = function( bob ){ // jshint ignore:line

    


    var oJobBuild = bob.createJob( 'build' );

    oJobBuild.addTask( 'task1', {
        enabled: false,
        do: function(){
            var deferred = Q.defer();

            console.log( '\nRunning task1...' );

            //throw new Error( 'Bork!' );

            setTimeout( deferred.resolve, 3000 );

            return deferred.promise;
        }// /do()
    });

    oJobBuild.addTask( 'task2', {
        enabled: true,
        do: function(){
            var deferred = Q.defer();

            console.log( '\nRunning task2...' );

            setTimeout( deferred.resolve, 3000 );

            return deferred.promise;
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

    bob.createJob( 'watch', function(){
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

    return bob;

};// /build()