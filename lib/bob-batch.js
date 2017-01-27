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
        running: false,
        paused: false,
        batch: this,
        tasks: [],
        _deferred: null,
        _taskIndex: {},
        _onDone: function(){},
        _onFail: function(){},// /_onFail()
        
        addTasks: function( cTag, aTasks ) {
            var i, l = aTasks.length, oTask;


            for( i = 0; i < l; i++ ) {
                oTask = aTasks[ i ];
                oTask.task = cTag.concat( ':', oTask.task );
                this.tasks.push( oTask );
            }// /for()
        },// /addTasks()

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
            var cFormattedName;

            if( !this._deferred ) {
                this._deferred =  Q.defer();
            }

            this.running = true;

            if( this.paused ) {
                
                cFormattedName = chalk.cyan( cBatchName.concat( cJob ) );
                util.log( 'default', `Deferring job "${cFormattedName}"...` );
                return this._deferred.promise;
            }

            return this.runNow( this._deferred );
        },// /run()

        pause: function(){
            this.paused = true;
        },// /pause()

        resume: function(){
            var cFormattedName, lWasPaused = this.paused;

            this.paused = false;

            if( lWasPaused && this.running ) {
                
                cFormattedName = chalk.cyan( cBatchName.concat( cJob ) );
                util.log( 'default', `Resuming job "${cFormattedName}"...` );

                this.runNow( this._deferred );
            }

        },// /resume()

        runNow: function( deferred ){
            //var deferred = Q.defer();
            var tJobStart = new Date();
            var cFormattedName = chalk.cyan( cBatchName.concat( cJob ) );
            var cCurrentTaskname; 
            var lastResult = null;
                
            util.log( 'default', `Running job "${cFormattedName}"...` );

            var doFail = function( err ){
                var cStack, cFormattedName = chalk.cyan( cCurrentTaskname );

                util.log( 'error', chalk.red( `Error in task "${cFormattedName}" ${err.toString()}` ) );

                if( err.stack ) {
                    //cStack = err.stack.split( '\n' ).slice( 0, 2 ).join( '' );
                    cStack = err.stack.split( '\n' )[1].trim();
                    util.log( 'error', chalk.bgRed( cStack ) );
                }
                
                self._onFail( err );
                deferred.reject( err );
            };// /doFail()
            
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
                    oPromise.then( next ).fail( doFail );
                }
            })
            .then( function(){
                var cElapsed = chalk.magenta( ''.concat( ( new Date() ) - tJobStart, ' ms' ) );

                util.log( 'default', `Completed job "${cFormattedName}" after ${cElapsed}.` );
                self._onDone();
                deferred.resolve();
            })
            .fail( doFail )
            .done(function(){
                self.running = false;
            });

            return deferred.promise;
        },// /runNow()

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