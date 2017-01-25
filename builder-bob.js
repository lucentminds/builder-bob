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

var util = require( './lib/bob-util.js' );
var Batch = require( './lib/bob-batch.js' );
var Bob = module.exports = {};


Bob.createBatch = function(){
    var self = Batch.apply( this, arguments );
    return self;
};// /createBatch()

Bob.createJob = function(){
    var batch = Bob.createBatch();
    return batch.createJob.apply( batch, arguments );
};// /createJob()

Bob.watch = function(){
    return util.watch.apply( this, arguments );
};// /watch()

Bob.log = function(){
    return util.log.apply( this, arguments );
};// /log()