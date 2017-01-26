/** 
 * 12-22-2016
 * ~~ Scott Johnson
 */

/** List jshint ignore directives here. **/
/* jslint node: true */
/* jshint esversion: 6 */
/* eslint-env es6 */


// Stop jshint from complaining about the promise.catch() syntax.
/* jslint -W024 */

var path = require( 'path' );
var Q = require( 'q' );
var forEach = require( 'promise-foreach' );
var chalk = require( 'chalk' );
var util = require( './bob-util.js' );
var Batch = module.exports = function( cTag ){
    var self = util.extend( {
        tag: cTag || '',
        _cache: {},
        _cwd: './',
        jobs: {}
    }, Batch.prototypes );

    return self;

};// /Batch()

Batch.prototypes = {};


Batch.prototypes.createBatch = function( /*cTag*/ ){
    return Batch.apply( this, arguments );
};// /createBatch()


Batch.prototypes.cwd = function( cCachePath ){
    this._cwd = cCachePath;
};// /cwd()


Batch.prototypes.resolve = function( cRelativePath ){
    if( !this._cache[ cRelativePath ] ) {
        this._cache[ cRelativePath ] = path.resolve( this._cwd, cRelativePath );
    }

    return this._cache[ cRelativePath ];
};// /resolve()

/** 
 * Creates a new job for multiple tasks.
 */
Batch.prototypes.createJob = function( cJob, fnDefault ){
    var cBatchName = this.tag ?this.tag.concat( ':' ) :'';

    var self = {
        batch: this,
        tasks: [],
        _taskIndex: {},
        _onDone: function(){},
        _onFail: function(){},// /_onFail()

        addTask: function( cTask, oOptions ) {
            var oTask;

            cTask = cTask || 'default';

            if(  self._taskIndex[ cTask ] ) {
                throw new Error( `Duplicate task "${cTask}" defined.` );
            }

            if( typeof oOptions === 'function' ) {
                oOptions = { do:arguments[ 1 ] };
            }

            oTask = util.extend({
                enabled: true,
                task: cTask
            }, oOptions );

            self.tasks.push( oTask );
            self._taskIndex[ cTask ] = oTask;
        },// /addTask()

        done: function( fnCallback ){
            this._onDone = fnCallback;
        },// /done()

        fail: function( fnCallback ){
            this._onFail = fnCallback;
        },// /fail()

        run: function(){
            var deferred = Q.defer();
            var tJobStart = new Date();
            var cFormattedName = chalk.cyan( cBatchName.concat( cJob ) );
            var cCurrentTaskname; 
            var lastResult = null;
                
            util.log( 'default', `Running job "${cFormattedName}"...` );
            
            forEach( self.tasks, function( oCurrent, nextTask ){
                var oPromise = null;
                var oTask = oCurrent.value;
                //var cTaskname = cBatchName.concat( cJob, '.', oTask.task );
                var cFormattedName;
                var tTaskStart = new Date();
                var next = function( result ){
                    var cElapsed = chalk.magenta( ''.concat( ( new Date() ) - tTaskStart, ' ms' ) );

                    util.log( 'default', `Finished task "${cFormattedName}" after ${cElapsed}.` );
                    lastResult = result;
                    nextTask();
                };// /next()

                cCurrentTaskname = cBatchName.concat( cJob, '.', oTask.task );

                if( oTask.enabled === false ) {
                    cFormattedName = chalk.yellow( cCurrentTaskname );
                    util.log( 'warning', `Skipped "${chalk.yellow( oTask.task )}".` );
                    return next();
                }

                cFormattedName = chalk.cyan( cCurrentTaskname );

                util.log( 'default', `Starting task "${cFormattedName}"...` );

                /** 
                 * Pass "next" as a way of allowing the task to complete itself
                 * without a promise.
                 */
                oPromise = oTask.do.apply( oTask, [ lastResult, next ] );
                
                if( oPromise ){
                    oPromise.done( next );
                }
            })
            .then( function(){
                var cElapsed = chalk.magenta( ''.concat( ( new Date() ) - tJobStart, ' ms' ) );

                util.log( 'default', `Completed job "${cFormattedName}" after ${cElapsed}.` );
                self._onDone();
                deferred.resolve();
            })
            .fail( function( err ){
                //var cFormattedName = chalk.cyan( cCurrentTaskname );
                var cFormattedError = chalk.red( err.toString() );

                util.log( 'error', `${cFormattedError}` );
                
                self._onFail( err );
                deferred.reject( err );
            })
            .done();

            return deferred.promise;
        },// /run()

        setTasks: function( aTasks ) {
            self.tasks = aTasks;
        }// /setTasks()
    };// /self()

    if( fnDefault ) {
        // Default task was added directly to the createJob call.
        self.addTask( 'default',{ do: fnDefault });
    }

    this.jobs[ cJob ] = self;

    return self;
};// /createJob()

/** 
 * Retrieves a job from a specific namespace.
 */
Batch.prototypes.getJob = function( cJob ){    
    return this.jobs[ cJob ];
};// /getJob()