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

//var Q = require( 'q' );
var watch = require( 'promise-file-watch' );
var chalk = require( 'chalk' );

var util = module.exports = {};

util.extend = function( obj1, obj2 ) {
    var i;

    for ( i in obj2 ) {
        obj1[ i ] = obj2[ i ];
    }// /for()

    return obj1;
};// /extend()



/**
 * General purpose logger.
 */
util.log = function( /*cLevel*/ ){
    var cMsg = [].slice.call( arguments, 1 ).join( ' ' );
    console.log.apply( console, [ util.time(), cMsg ] );
};// /log()

/**
 * Format current time as hh:mm:ss.
 */
util.time = function(){
    var t = new Date();
    var cTime = chalk.gray( [ t.getHours(), t.getMinutes(), t.getSeconds() ].map( util.lpad ).join( ':' ) );

    return '['.concat( cTime, ']' );
};// /time()

util.watch = function( aSrc, fnCallback ){
    var i, l;

    if( !Array.isArray( aSrc ) ) {
        aSrc = [ aSrc ];
    }

    return watch( aSrc, function( cPathChanged ){
        var cPath = chalk.green( cPathChanged );

        util.log( 'default', `Changed:  "${cPath}".` );
        fnCallback.call( aSrc, cPathChanged );

    }, function( err ){
        // Failed catch.
        util.log( 'error', `Error:  "${chalk.red( err )}".` );
    })
    .then(function( aWatched ){
        // All paths watched!
        //var deferred = Q.defer();

        for( i = 0, l = aWatched.length; i < l; i++ ) {
            util.log( 'default', `Watching "${chalk.green( aWatched[ i ] )}"...` );
        }// /for()

        //return deferred.promise;
    });


};// /watch()

util.lpad = function ( value ) {
    return (value.toString().length < 2) ? util.lpad("0"+value, 2):value;
};// /lpad()

