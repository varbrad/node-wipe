# node-wipe
Node script to remove `node_modules` folder of inactive projects.

# Install
```shell
npm install node-wipe -g
```

# Usage
## Patterns
````shell
node-wipe
node-wipe [path]
node-wipe [days]
node-wipe [path] [days]
````
## Examples
`node-wipe`

Will wipe all subdirectories within the current working directory of their `node_modules` if the project was last modified longer ago than 30 days.

`node-wipe ./dev/`

Will wipe all subdirectories within the 'dev' folder of their `node_modules` if the project was last modified within 30 days.

`node-wipe 10`

Will wipe all subdirectories within the current working directory of their `node_modules` if the project was last modified longer ago than 10 days.

`node-wipe ./dev/ 10`

Will wipe all subdirectories within the 'dev' folder of their `node_modules` if the project was last modified within 10 days.

## Parameters
All parameters are optional.

### path
__Default__ = `"."`

A relative or absolute path to a directory.

### days
__Default__ = `30`

The number of days to consider a project 'inactive' and remove the `node_modules` from if it has not been modified for this long.

### force
__Default__ = `false`

__Usage__ `-f`, `--force`

Whether to automatically accept the warning messages.
