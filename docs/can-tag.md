@function can-view-import.can-tag can-tag
@parent can-view-import.attributes

@description Use another [can-view-callbacks.tag] (such as a [can-component]) to control the `<content>` of a [can-view-import]. 

@signature `can-tag="TAG_NAME"`

Instantiates the provided [can-view-callbacks.tag] and sets its [can-component::viewModel viewModel] to be the Promise for the import.

@param {String} TAG_NAME The tag name (usually a [can-component]) to use.

@body

## Use

**can-tag** allows for injecting a component, using the imported promise as the
injected component's view model.

The example below shows a loading graphic until the cart component has been loaded.
Once the cart promise is resolved, `<shopping-cart></shopping-cart>` is injected
into the page.

Loading Indicator Component

```
var template = stache('{{#isResolved}}<content/>{{else}}<img src="loading.gif"/>{{/isResolved}}');

Component.extend({
  tag: "loading-indicator",
  view: template
});
```

Main Template

```
<can-import from="cart" can-tag="loading-indicator">
  <shopping-cart></shopping-cart>
</can-import>
```
