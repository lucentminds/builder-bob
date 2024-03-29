# builder-bob
![builder-bob](https://cloud.githubusercontent.com/assets/338596/22276551/0625116a-e27a-11e6-9e18-93cf3bc3eb2a.png) Yet another builder tool.

```shell
npm install git+https://github.com/lucentminds/builder-bob.git
```

## Example bobfile

```js
module.exports = function( bob ) {
        
    const job = bob.createJob( 'build' );

    // Do this first.
    job.addTask( 'step_1', function(){
        return new Promise(( resolve ) => {
            console.log( '\nRunning step_1...' );
            setTimeout( resolve( 'foo' ), 3000 );
        });
    });

    // Do this second.
    job.addTask( 'step_2', function( previous_result, next ){
        console.log( `${previous_result} bar` ) // foo bar
        return next();
    });

    // Always return bob. :)
    return bob;
};// /exports()
```

Or all at once.

```js
module.exports = function( bob ) {
        
    const job = bob.createJob( 'task' );

    job.setTasks([
        // Do this first.
        {
            task: 'empty',
            do: function(){
                // Create promises here.
            },
        },
        
        // Do this second.
        {
            task: 'copy',
            do: function(){
                // Create promises here.
            },
        },
    ]);
    
    // Always return bob. :)
    return bob;
};// /exports()
```

For more see [the builder-bob wiki](https://github.com/lucentminds/builder-bob/wiki).

## TODO

* Make it so that if a build job is running, it MUST complete before allowing another to run. This is because of file contention issues. So make a combo throttle/debouncer to wait until previous job is complete before allowing the latest request.
* Develop a spiffy CLI for bob.