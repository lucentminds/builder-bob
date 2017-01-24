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
var fs = require( 'fs' );
var forEach = require( 'promise-foreach' );
var resolve = require( 'promise-resolve-path' );
var watch = require( 'promise-file-watch' );
var chalk = require( 'chalk' );
//var BobRunner = module.exports = {};
var BobRunner = {};
var extend = function( obj1, obj2 ) {
    var i;

    for ( i in obj2 ) {
        obj1[ i ] = obj2[ i ];
    }// /for()

    return obj1;
};// /extend()


BobRunner.prototypes = {};

BobRunner.prototypes.jobs = { 'default':{} };

BobRunner.factory = function( oSettings ){
    var self = extend( {}, BobRunner.prototypes );

    extend( self, oSettings );

    return self;
};// /factory()

/** 
 * General purpose logger.
 */
BobRunner.prototypes.log = function( cLevel ){
    var cMsg = [].slice.call( arguments, 1 ).join( ' ' );
    console.log.apply( console, [ this.time(), cMsg ] );
};// /log()

/** 
 * Format current time as hh:mm:ss.
 */
BobRunner.prototypes.time = function(){
    var t = new Date();
    var cTime = chalk.gray( [ t.getHours(), t.getMinutes(), t.getSeconds() ].map( lpad ).join( ':' ) );

    return '['.concat( cTime, ']' );
};// /time()

BobRunner.prototypes.watch = function( aSrc, fnCallback ){
    var i, l, nTimeout = 0;
    var bob = this;

    if( !Array.isArray( aSrc ) ) {
        aSrc = [ aSrc ];
    }

    return watch( aSrc, function( cPathChanged ){
        var cPath = chalk.green( cPathChanged );

        bob.log( 'default', `Changed:  "${cPath}".` );
        fnCallback.call( bob, cPathChanged );

    }, function( err ){
        // Failed catch.
        bob.log( 'error', `Error:  "${chalk.red( err )}".` );
    })
    .then(function( aWatched ){
        // All paths watched!
        var deferred = Q.defer();

        for( i = 0, l = aWatched.length; i < l; i++ ) {
            bob.log( 'default', `Watching "${chalk.green( aWatched[ i ] )}"...` );
        }// /for()

        return deferred.promise;
    });


};// /watch()

/** 
 * Creates a new job for multiple tasks.
 */
BobRunner.prototypes.createJob = function( cJob, fnDefault ){
    var bob = this;
    var cNamespace = getNamespaceFromJob( cJob );

    var self = {
        tasks: [],        
        _onDone: function(){},
        _onFail: function( err ){
            //throw err;
        },// /_onFail()

        addTask: function( cTask, oOptions ) {
            var oTask = extend({
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
            var cFormattedName = chalk.cyan( cJob );
                
            bob.log( 'default', `Running job "${cFormattedName}"...` );
            
            forEach( self.tasks, function( oCurrent, next ){
                var oTask = oCurrent.value;
                var cFormattedName;
                var tTaskStart = new Date();

                if( oTask.enabled === false ) {
                    cFormattedName = chalk.yellow( cJob.concat( '.', oTask.task ) )
                    bob.log( 'warning', `Skipped "${chalk.yellow( oTask.task )}".` );
                    return next();
                }

                cFormattedName = chalk.cyan( cJob.concat( '.', oTask.task ) );

                bob.log( 'default', `Starting task "${cFormattedName}"...` );
                oTask.do().done(function(){
                    var cElapsed = chalk.magenta( ''.concat( ( new Date() ) - tTaskStart, ' ms' ) );

                    bob.log( 'default', `Finished task "${cFormattedName}" after ${cElapsed}.` );
                    next();
                });
            })
            .fail( function( err ){
                self._onFail( err );
                deferred.reject( err );
            })
            .done( function(){
                var cElapsed = chalk.magenta( ''.concat( ( new Date() ) - tJobStart, ' ms' ) );

                bob.log( 'default', `Completed job "${cFormattedName}" after ${cElapsed}.` );
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
    

    this.jobs[ cNamespace ][ cJob ] = self;

    return self;
};// /createJob()

/** 
 * Retrieves a job from a specific namespace.
 */
BobRunner.prototypes.getJob = function( cJob, undefined ){
    var oNamespace;
    var cNamespace = getNamespaceFromJob( cJob );
    oNamespace = this.jobs[ cNamespace ];

    if( !oNamespace ) {
        return undefined;
    }
    
    return oNamespace[ cJob ];
};// /getJob()

var getNamespaceFromJob = function( cJob ) {
    var aParts = cJob.split( '.' );

    if( aParts.length > 1 ) {
        return aParts[0];
    }

    return 'default';
};// /getNamespaceFromJob()


var lpad = function ( value ) {
    return (value.toString().length < 2) ? lpad("0"+value, 2):value;
};// /lpad()
 
 
 module.exports = BobRunner.factory();