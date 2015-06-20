# Roguelike 2

![Codeship Build Status](https://codeship.com/projects/55165c50-f967-0132-6144-3ea2b5fe25d4/status?branch=master)

A roguelike.

## Platforms

You will need functioning installations of:

- NodeJS (recommended: [nodenv](https://github.com/OiNutter/nodenv) or [NVM](https://github.com/creationix/nvm))

## Dependencies

Libraries and packages are managed by:

- [NPM](package.json)

## Source

The JavaScript is written in [ES6](https://kangax.github.io/compat-table/es6/)
and [JSX](https://facebook.github.io/react/docs/jsx-in-depth.html),
using [ES6 modules](http://www.2ality.com/2014/09/es6-modules-final.html).

The CSS is written using [Less](http://lesscss.org/).

## Directory structure

```
  /
    bin/       # Scripts, mostly for convenience
    lib/       # Third party libraries
    out/       # Compiled output
    src/       # Application source
      assets/  # Images, fonts, etc.
```
## Build system

### Available tasks

The build system is powered by NPM. To get a list of available tasks run:

```bash
npm run
```

### Languages and compiling

* JavaScript
  * [Browserify](http://browserify.org/) is used to traverse the dependency tree, compile the source to
    browser-compatible ES5, and concatenate the output.
  * [Babel](https://babeljs.io/) is used by Browserfiy to compile ES6/7 and JSX to ES5, and is invoked through
    [babelify](https://github.com/babel/babelify).
* CSS
  * [Less](http://lesscss.org/)
* Search paths
  * `node_modules`, `lib`, and `src` are searched when resolving imports in JS and CSS (see
    [package.json](package.json)'s `config` hash)
* Source maps
  * `less` and `browserify` are both configured to output source maps, including the complete original source, in their
    compiled output. You shouldn't need any additional setup in your browser to use them.

## Development

In development you really only need to use

```bash
npm run serve
```

It will build and watch the source and serve it locally.

## Scripts

* `bin/`
  * `exec` - A shortcut for executing locally installed Node modules' `bin` scripts
    * Before: `./node_modules/.bin/less`
    * After: `./bin/exec less`
  * `run` - A shortcut for `npm run` that lets you run multiple scripts more easily
    * Before: `npm run clean && npm run build-js && npm run build-css && npm run build-html`
    * After: `./bin run clean build-js build-css build-html`
    * Options:
      * `-s` - if the first argument is `-s` it will be passed as `npm run -s`
  * `run-parallel` - A wrapper for `bin/run` that runs tasks in parallel using
    [parallelshell](https://github.com/keithamus/parallelshell)
    * Before: `parallelshell 'npm run build-js' 'npm run build-css' 'npm run build-html'`
    * After: `./bin/run-parallel build-js build-css build-html`
    * Options:
      * `-s` - if the first argument is `-s` it will be passed as `npm run -s`

## [Chrome Workspaces](https://developer.chrome.com/devtools/docs/workspaces)
  * To enable, add the project directory to your workspace by right-clicking in the sources tab's navigation pane and
    choosing "Add Folder to Workspace"
  * Then set up mappings between your network resources and local filesystem (see Chrome's documentation for details)
