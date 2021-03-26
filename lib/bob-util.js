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
// var watch = require( 'promise-file-watch' );
const chokidar = require( 'chokidar' );
const resolve = require( 'promise-resolve-path' );
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

util.watch = function( a_sources, fnCallback ){
    if( !Array.isArray( a_sources ) ) {
        a_sources = [ a_sources ];
    }

    resolve( a_sources, true )
    .then(function( aSrc ){
        const o_watcher = chokidar.watch( aSrc, {
            ignored: /(^|[\/\\])\../, // ignore dotfiles
            persistent: true,
        } );

        o_watcher.on( 'all', function( c_event, c_path_changed ){
            if( ['add'].indexOf( c_event ) > -1  ){
                // Ignore notices about individual files being watched.
                return;
            }

            if( ['addDir'].indexOf( c_event ) > -1  ){
                util.log( 'default', `Watching "${chalk.green( c_path_changed )}"...` );
                return;
            }
            
            var c_path = chalk.green( c_path_changed );

            util.log( 'default', `Changed:  "${c_path}".` );
            fnCallback.call( aSrc, c_path_changed );
        });

        // for( i = 0, l = aSrc.length; i < l; i++ ) {
        //     util.log( 'default', `Watching "${chalk.green( aSrc[ i ] )}"...` );
        // }// /for()
    },
    function( err ){
        // Failed catch.
        util.log( 'error', `Error:  "${chalk.red( err )}".` );
    });

    return new Promise(function( resolve, reject ){
    });// /new Promise()

};// /watch()

util.lpad = function ( value ) {
    return (value.toString().length < 2) ? util.lpad("0"+value, 2):value;
};// /lpad()

