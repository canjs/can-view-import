define(["can-component", "can-stache"], function(Component, stache){

	Component.extend({
		tag: "hello-world",
		template: stache("Hello world!")
	});

});
