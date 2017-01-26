/** List jshint ignore directives here. **/
/* jslint node: true */
/* jshint esversion: 6 */
/* eslint-env es6 */

// ./modules/module1/bobfile.js
var path = require( 'path' );
var builder = module.exports = function( bob ){ // jshint ignore:line

    // Create the "build" job.
    var buildJob = bob.createJob( 'build', function(){
        
        console.log( '\nPut module build stuff here!' );
        console.log( __filename );
        console.log( __dirname );
        console.log( path.resolve() );

    });

    // Add another task to the build job.
    buildJob.addTask( 'another-task', function(){
        
        console.log( '\nThis is another task!' );

    });

    // Always return bob. :)
    return bob;

};// /export()