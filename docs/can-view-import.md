@module {function} can-view-import can-view-import
@parent can-views
@collection can-ecosystem
@package ../package.json
@group can-view-import.pages 0 Pages
@group can-view-import.attributes 1 Attributes

@signature `<can-import from="MODULE_NAME" />`

Statically import a module from within a [can-stache] template. *MODULE_NAME* will be imported before the template renders.

```
<can-import from="components/tabs" />
<tabs-widget />
```

@param {moduleName} [MODULE_NAME] A module that this template depends on.

@signature `<can-import from="MODULE_NAME">content</can-import>`

Dynamically import *MODULE_NAME* if *content* is anything other than whitespace; the scope within the template is a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

```
<can-import from="components/tabs">
  {{#if isResolved}}
    <tabs-widget />
  {{/if}}
</can-import>
```

@param {moduleName} [MODULE_NAME] A module that this template depends on.

@signature `<can-dynamic-import from="MODULE_NAME">content</can-dynamic-import>`

Dynamically import *MODULE_NAME*; the scope within the template is a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

```
<can-dynamic-import from="components/tabs">
  {{#if isResolved}}
    <tabs-widget />
  {{/if}}
</can-dynamic-import>
```

@param {moduleName} [MODULE_NAME] A module that this template depends on.

@signature `<can-dynamic-import from="MODULE_NAME" value:to="*MODULE_REF"/>`

Dynamically import a module from within a [can-stache] template. Since there is no subtemplate to attach the [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) to as the current scope, you must export the Promise's resolved value to the template's refs scope using [can-view-import.value].

```
<can-dynamic-import from="components/tabs" value:to="*tabsWidget" />
{{#if *tabsWidget}}
	<tabs-widget />
{{/if}}

{{! other can-reflect-promise keys also work, as does the *REFERENCE shorthand from can-stache-bindings }}

<can-dynamic-import from="components/tabs" 
	isPending:to="*tabsWidgetPending"
	isRejected:to="*tabsWidgetError"
	this:to"*tabsWidgetPromise" />
{{#if *tabsWidgetPending}}
	Loading...
{{else}}
	<tabs-widget />
	{{#if *tabsWidgetError}}
		{{*tabsWidgetPromise.reason}}
	{{/if}}
{{/if}}

{{! load a stache partial 
	 -- staches are functions, so prefix it with `@` to put the function in the ref scope without running it }}

<can-dynamic-import from "my-partial.stache!" @value:to="*myPartial" />

{{> *myPartial}}


```

@param {moduleName} [MODULE_NAME] A module that this template depends on.

@body

## Use

A template might depend on component or helper modules. `<can-import>` allows
you to specify these dependencies.

Example:

```
<can-import from="components/my_tabs"/>
<can-import from="helpers/prettyDate"/>

<my-tabs>
  <my-panel title="{{prettyDate start}}">...</my-panel>
  <my-panel title="{{prettyDate end}}">...</my-panel>
</my-tabs>
```

Currently this __only__ works with [can-view-autorender] or the [steal-stache] plugin.

## Progressive Loading

A template may (conditionally) load a module after the initial page load. `<can-import>` allows progressive loading by using an end tag.

This example shows a component being loaded ad hoc:

```
<can-import from="components/home"></can-import>
```

This example illustrates conditionally loading modules based on some application state:

```
{{#eq location 'home'}}
  <can-import from="components/home">
    ...
  </can-import>
{{/eq}}

{{#eq location 'away'}}
  <can-import from="components/away">
    ...
  </can-import>
{{/eq}}
```
