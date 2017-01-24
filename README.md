# builder-bob
Yet another builder app.

# NOTE:
Make it so that if a build job is running, it MUST complete before allowing another to run. This is because of file contention issues. So make a combo throttle/debouncer to wait until previous job is complete before allowing the latest request.

```shell
npm install git+https://github.com/lucentminds/builder-bob.git
```

## Example bobfile

```js
module.exports = function( bob ) {
        
    var oBuild = bob.createJob( 'task' );

    // Do this first.
    oBuild.addTask( 'empty', {
        enabled: false,
        dirs: [
            "./build",
            "./temp"
        ]
    });

    // Do this second.
    oBuild.addTask( 'copy', {
        name: "Copy php files to build",
        enabled: true,
        do: function(){
            // Create promises here.
        }
    });
};// /exports()
```

Or all at once.

```js
module.exports = function( bob ) {
        
    var oBuild = bob.createJob( 'task' );

    oBuild.setTasks([
        // Do this first.
        {
            task: 'empty',
            enabled: false,
            do: function(){
                // Create promises here.
            }
        },
        
        // Do this second.
        {
            task: 'copy',
            enabled: true,
            do: function(){
                // Create promises here.
            }
        }
    ]);
};// /exports()
```