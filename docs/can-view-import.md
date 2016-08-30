@module {function} can-view-import can-view-import
@parent can-infrastructure
@group can-view-import.pages 0 Pages
@group can-view-import.attributes 1 Attributes

@signature `&lt;can-import from="MODULE_NAME" /&gt;`

Statically import a module from with a [can-stache] template. *MODULE_NAME* will be imported before the template renders.

```
<can-import from="components/tabs" />
<tabs-widget />
```

@param {moduleName} [MODULE_NAME] A module that this template depends on.

@signature `&lt;can-import from="MODULE_NAME"&gt;content&lt;/can-import&gt;`

Dynamically import a module. *MODULE_NAME* will be imported dynamically; the scope within the template is a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

```
<can-import from="components/tabs">
	{{#if isResolved}}
		<tabs-widget />
	{{/if}}
</can-import>
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

A template may load or conditionally load a module after the initial page load. `<can-import>` allows progressive loading by using an end tag.

The first example below shows a component being loaded ad hoc. The second illustrates conditionally loading modules based on some application state.

Example:

```
<can-import from="components/home"></can-import>
```

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
