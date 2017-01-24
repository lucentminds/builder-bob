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
var job = require( './bobfile.js' )( bob );


bob.getJob( 'watch' ).run();