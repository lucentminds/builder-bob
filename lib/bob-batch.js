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

var Q = require( 'q' );
var forEach = require( 'promise-foreach' );
var chalk = require( 'chalk' );
var util = require( './bob-util.js' );
var Batch = module.exports = function( cName ){
    var self = util.extend( {
        name: cName || '',
        jobs: {}
    }, Batch.prototypes );

    return self;

};// /Batch()

Batch.prototypes = {};

/** 
 * Creates a new job for multiple tasks.
 */
Batch.prototypes.createJob = function( cJob, fnDefault ){
    var batch = this;
    var cBatchName = this.name ?this.name.concat( ':' ) :'';

    var self = {
        batch: this,
        tasks: [],
        _onDone: function(){},
        _onFail: function(){},// /_onFail()

        addTask: function( cTask, oOptions ) {
            var oTask;

            if( typeof oOptions === 'function' ) {
                oOptions = { do:arguments[ 1 ] };
            }

            oTask = util.extend({
                enabled: true,
                task: cTask
            }, oOptions );

            self.tasks.push( oTask );
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
                
            util.log( 'default', `Running job "${cFormattedName}"...` );
            
            forEach( self.tasks, function( oCurrent, next ){
                var oTask = oCurrent.value;
                var cTaskname = cBatchName.concat( cJob, '.', oTask.task );
                var cFormattedName;
                var tTaskStart = new Date();

                if( oTask.enabled === false ) {
                    cFormattedName = chalk.yellow( cTaskname );
                    util.log( 'warning', `Skipped "${chalk.yellow( oTask.task )}".` );
                    return next();
                }

                cFormattedName = chalk.cyan( cTaskname );

                util.log( 'default', `Starting task "${cFormattedName}"...` );
                oTask.do().done(function(){
                    var cElapsed = chalk.magenta( ''.concat( ( new Date() ) - tTaskStart, ' ms' ) );

                    util.log( 'default', `Finished task "${cFormattedName}" after ${cElapsed}.` );
                    next();
                });
            })
            .fail( function( err ){
                self._onFail( err );
                deferred.reject( err );
            })
            .done( function(){
                var cElapsed = chalk.magenta( ''.concat( ( new Date() ) - tJobStart, ' ms' ) );

                util.log( 'default', `Completed job "${cFormattedName}" after ${cElapsed}.` );
                self._onDone();
                deferred.resolve();
            });

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