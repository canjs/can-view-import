var SimpleMap = require('can-simple-map');
//var Component = require('can-component');
var stache = require('can-stache');
var getIntermediateAndImports = require('can-stache/src/intermediate_and_imports');
var QUnit = require('steal-qunit');
var importer = require('can-util/js/import/import');
var tag = require('can-view-callbacks').tag;
var testHelpers = require('can-test-helpers');
var SimpleObservable = require("can-simple-observable");

require('./can-view-import');

if(window.steal) {
	QUnit.module("can/view/import");

	var test = QUnit.test;
	var equal = QUnit.equal;

	test("static imports are imported", function(){
		var iai = getIntermediateAndImports("<can-import from='can-view-import/test/hello'/>" +
		"<hello-world></hello-world>");

		equal(iai.imports.length, 1, "There is one import");
	});

	test("dynamic imports are not imported", function(){
		var iai = getIntermediateAndImports("{{#if a}}<can-import from='can-view-import/test/hello'>" +
		"<hello-world></hello-world></can-import>{{/if a}}");

		equal(iai.imports.length, 0, "There are no imports");
	});

	if (!System.isEnv('production')) {
		asyncTest("dynamic imports will only load when in scope", function(){
			expect(4);

			var iai = getIntermediateAndImports("{{#if a}}<can-import from='can-view-import/test/hello'>" +
			"{{#eq state 'resolved'}}<hello-world></hello-world>{{/eq}}</can-import>{{/if a}}");
			var template = stache(iai.intermediate);

			var a = new SimpleObservable(false);
			var res = template({ a: a });

			equal(res.childNodes[0].childNodes.length, 0, "There are no child nodes immediately");
			a.set(true);

			importer("can-view-import/test/hello").then(function(){
				equal(res.childNodes[0].childNodes.length, 1, "There is now a nested component");
				equal(res.childNodes[0].childNodes[0].tagName.toUpperCase(), "HELLO-WORLD", "imported the tag");
				equal(res.childNodes[0].childNodes[0].childNodes[0].nodeValue, "Hello world!", "text inserted");
				start();
			});
		});
	}

	test("if a can-tag is present, handed over rendering to that tag", function(){
		var iai = getIntermediateAndImports("<can-import from='can-view-import/test/hello' can-tag='loading'/>");
		tag("loading", function(el){
			var template = stache("it worked");
			el.appendChild(template());
		});
		var template = stache(iai.intermediate);

		var res = template();
		equal(res.childNodes[0].childNodes[0].nodeValue, "it worked", "Rendered with the can-tag");
	});

	// Issue #2 "can-import can-tag fails silently when tag does not exist"
	//  https://github.com/canjs/can-view-import/issues/2
	testHelpers.dev.devOnlyTest("if a can-tag is present, but not registered, should throw error (#2)", function(){
		var iai = getIntermediateAndImports("<can-import from='can-view-import/test/hello' can-tag='not-exist'/>");
		var template = stache(iai.intermediate);
		var finishWarningCheck = testHelpers.dev.willError("The tag 'not-exist' has not been properly registered.", function(message, matched) {
			if(matched) {
				ok(true, "Error message properly sent");
			}
		});
		template();
		finishWarningCheck();
	});

	testHelpers.dev.devOnlyTest("if a can-tag is present, but not registered, should throw error (#2)", function(){
		var iai = getIntermediateAndImports("<can-import from='can-view-import/test/hello' can-tag='notexist'/>");
		var template = stache(iai.intermediate);
		var finishWarningCheck = testHelpers.dev.willError("The tag 'notexist' has not been properly registered.", function(message, matched) {
			if(matched) {
				ok(true, "Error message properly sent");
			}
		});
		template();
		finishWarningCheck();
	});

	if (!System.isEnv('production')) {
		asyncTest("can use an import's value", function(){
			var template = "<can-import from='can-view-import/test/person' @value:to='*person' />hello {{*person.name}}";

			var iai = getIntermediateAndImports(template);

			var renderer = stache(iai.intermediate);
			var res = renderer(new SimpleMap());

			importer("can-view-import/test/person").then(function(){
				equal(res.childNodes[2].nodeValue, "world", "Got the person.name from the import");
				start();
			});
		});
	}
	/*
	if (!System.isEnv('production')) {
		asyncTest("can import a template and use it", function(){
			var template = "<can-import from='can-view-import/test/other.stache!' @value:to='*other' />{{{*other()}}}";

			stache.async(template).then(function(renderer){
				var frag = renderer();

				// Import will happen async
				importer("can-view-import/test/other.stache!").then(function(){
					equal(frag.childNodes[3].firstChild.nodeValue, "hi there", "Partial was renderered right after the can-import");

					QUnit.start();
				});
			});
		});
	}

	if (!System.isEnv('production')) {
		asyncTest("can import a template and use it using the > syntax", function(){
			var template = "<can-import from='can-view-import/test/other.stache!' @value:to='*other' />{{> *other}}";

			stache.async(template).then(function(renderer){
				var frag = renderer();

				// Import will happen async
				importer("can-view-import/test/other.stache!").then(function(){
					equal(frag.childNodes[3].firstChild.nodeValue, "hi there", "Partial was renderered right after the can-import");

					QUnit.start();
				});
			});
		});
	}

	if (!System.isEnv('production')) {
		asyncTest("importing a template works with can-tag", function(){
			Component.extend({
				tag: "my-waiter",
				view: stache("{{#isResolved}}" +
				"<content></content>" +
				"{{else}}" +
				"<div class='loading'></div>" +
				"{{/isResolved}}"),
				leakScope: true
			});

			var template = "<can-import from='can-view-import/test/other.stache' @value:to='*other' can-tag='my-waiter'>{{{*other()}}}</can-import>";

			var finishWarningCheck = testHelpers.dev.willWarn(/is not in the current scope/, function(message, matched) {
				QUnit.notOk(matched, "importPromise throws a false-positive warning (#83)");
			});

			stache.async(template).then(function(renderer){
				var frag = renderer(new SimpleMap());

				finishWarningCheck();

				importer("can-view-import/test/other.stache").then(function(){
					ok(frag.childNodes[0].childNodes.length > 1, "Something besides a text node is inserted");
					equal(frag.childNodes[0].childNodes[2].firstChild.nodeValue, "hi there", "Partial worked with can-tag");

					QUnit.start();
				});
			});
		});
	}

	if (!System.isEnv('production')) {
		asyncTest("can dynamically import a template with can-import and use it", function(){
			var template = "<can-import from='can-view-import/test/other-dynamic.stache!' @value:to='*other'/>{{> *other}}";

			stache.async(template).then(function(renderer){
				var frag = renderer();

				// Import will happen async
				importer("can-view-import/test/other.stache!").then(function(){
					equal(frag.childNodes[3].firstChild.nodeValue, "hi there", "Partial was renderered right after the can-import");

					QUnit.start();
				});
			});

		});
		asyncTest("can dynamically import a template with can-dynamic-import (self-closing) and use it", function(){
			var template = "<can-import from='can-view-import/test/other-dynamic-unary.stache!' @value:to='*other'/>{{> *other}}";

			stache.async(template).then(function(renderer){
				var frag = renderer();

				// Import will happen async
				importer("can-view-import/test/other.stache!").then(function(){
					equal(frag.childNodes[3].firstChild.nodeValue, "hi there", "Partial was renderered right after the can-import");

					QUnit.start();
				});
			});

		});
		asyncTest("can dynamically import a template with can-dynamic-import and use it", function(){
			var template = "<can-import from='can-view-import/test/other-dynamic-block.stache!' @value:to='*other'/>{{> *other}}";

			stache.async(template).then(function(renderer){
				var frag = renderer();

				// Import will happen async
				importer("can-view-import/test/other.stache!").then(function(){
					equal(frag.childNodes[3].firstChild.nodeValue, "hi there", "Partial was renderered right after the can-import");

					QUnit.start();
				});
			});

		});
	}

	if(!System.isEnv("production") && typeof console === "object") {
		asyncTest("loading errors are logged to the console", function(){
			var template = "<can-import from='can-view-import/test/error'>{{foo}}</can-import>";

			var error = console.error;
			console.error = function(type){
				console.error = error;
				QUnit.ok(/ERROR/.test(type), "Logged an error that originated from the dynamically imported module");
				QUnit.start();
			};

			stache.async(template).then(function(renderer){
				renderer({});
			});
		});
	}
	*/
}
