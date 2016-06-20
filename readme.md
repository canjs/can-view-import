# can-view-import

[![Build Status](https://travis-ci.org/canjs/can-view-import.png?branch=master)](https://travis-ci.org/canjs/can-view-import)

Import dependencies in Stache views.

- <code>[__can-view-import__ function](#can-view-import-function)</code>
  - <code>[&lt;can-import from="MODULE_NAME" /&gt;](#ltcan-import-frommodule_name-gt)</code>
  - <code>[&lt;can-import from="MODULE_NAME"&gt;content&lt;/can-import&gt;](#ltcan-import-frommodule_namegtcontentltcan-importgt)</code>

## API


## <code>__can-view-import__ function</code>



### <code>&lt;can-import from="MODULE_NAME" /&gt;</code>


Statically import a module from with a [stache](https://github.com/canjs/can-stache) template. *MODULE_NAME* will be imported before the template renders.

```
<can-import from="components/tabs" />
<tabs-widget />
```


1. __MODULE_NAME__ <code>{moduleName}</code>:
  A module that this template depends on.
  

### <code>&lt;can-import from="MODULE_NAME"&gt;content&lt;/can-import&gt;</code>


Dynamically import a module. *MODULE_NAME* will be imported dynamically; the scope within the template is a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

```
<can-import from="components/tabs">
	{{#if isResolved}}
		<tabs-widget />
	{{/if}}
</can-import>
```


1. __MODULE_NAME__ <code>{moduleName}</code>:
  A module that this template depends on.
  
## Contributing

### Making a Build

To make a build of the distributables into `dist/` in the cloned repository run

```
npm install
node build
```

### Running the tests

Tests can run in the browser by opening a webserver and visiting the `test.html` page.
Automated tests that run the tests from the command line in Firefox can be run with

```
npm test
```
