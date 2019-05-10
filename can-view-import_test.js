var SimpleMap = require('can-simple-map');
var stache = require('can-stache');
var getIntermediateAndImports = require('can-stache/src/intermediate_and_imports');
var QUnit = require('steal-qunit');
var importer = require('can-import-module');
var tag = require('can-view-callbacks').tag;
var testHelpers = require('can-test-helpers');
var SimpleObservable = require("can-simple-observable");
var DOCUMENT = require("can-globals/document/document");

require('./can-view-import');

if(window.steal) {
	QUnit.module("can/view/import");

	var test = QUnit.test;
	var equal = assert.equal;

	QUnit.test("static imports are imported", function(assert) {
		var iai = getIntermediateAndImports("<can-import from='can-view-import/test/hello'/>" +
		"<hello-world></hello-world>");

		assert.equal(iai.imports.length, 1, "There is one import");
	});

	QUnit.test("dynamic imports are not imported", function(assert) {
		var iai = getIntermediateAndImports("{{#if a}}<can-import from='can-view-import/test/hello'>" +
		"<hello-world></hello-world></can-import>{{/if a}}");

		assert.equal(iai.imports.length, 0, "There are no imports");
	});

	if (!System.isEnv('production')) {
		QUnit.test("dynamic imports will only load when in scope", function(assert) {
            var ready = assert.async();
            assert.expect(4);

            var iai = getIntermediateAndImports("{{#if a}}<can-import from='can-view-import/test/hello'>" +
			"{{#eq state 'resolved'}}<hello-world></hello-world>{{/eq}}</can-import>{{/if a}}");
            var template = stache(iai.intermediate);

            var a = new SimpleObservable(false);
            var res = template({ a: a });

            assert.equal(res.childNodes[0].childNodes.length, 0, "There are no child nodes immediately");
            a.set(true);

            importer("can-view-import/test/hello").then(function(){
				assert.equal(res.childNodes[0].childNodes.length, 1, "There is now a nested component");
				assert.equal(res.childNodes[0].childNodes[0].tagName.toUpperCase(), "HELLO-WORLD", "imported the tag");
				assert.equal(res.childNodes[0].childNodes[0].childNodes[0].nodeValue, "Hello world!", "text inserted");
				ready();
			});
        });
	}

	QUnit.test("if a can-tag is present, handed over rendering to that tag", function(assert) {
		var iai = getIntermediateAndImports("<can-import from='can-view-import/test/hello' can-tag='loading'/>");
		tag("loading", function(el){
			var template = stache("it worked");
			el.appendChild(template());
		});
		var template = stache(iai.intermediate);

		var res = template();
		assert.equal(res.childNodes[0].childNodes[0].nodeValue, "it worked", "Rendered with the can-tag");
	});

	// Issue #2 "can-import can-tag fails silently when tag does not exist"
	//  https://github.com/canjs/can-view-import/issues/2
	testHelpers.dev.devOnlyTest("if a can-tag is present, but not registered, should throw error (#2)", function (assert){
		var iai = getIntermediateAndImports("<can-import from='can-view-import/test/hello' can-tag='not-exist'/>");
		var template = stache(iai.intermediate);
		var finishWarningCheck = testHelpers.dev.willError("The tag 'not-exist' has not been properly registered.", function(message, matched) {
			if(matched) {
				assert.ok(true, "Error message properly sent");
			}
		});
		template();
		finishWarningCheck();
	});

	testHelpers.dev.devOnlyTest("if a can-tag is present, but not registered, should throw error (#2)", function (assert){
		var iai = getIntermediateAndImports("<can-import from='can-view-import/test/hello' can-tag='notexist'/>");
		var template = stache(iai.intermediate);
		var finishWarningCheck = testHelpers.dev.willError("The tag 'notexist' has not been properly registered.", function(message, matched) {
			if(matched) {
				assert.ok(true, "Error message properly sent");
			}
		});
		template();
		finishWarningCheck();
	});

	if (!System.isEnv('production')) {
		/*asyncTest("nodeLists are properly handed down", function(){
			expect(1);

			var templateString = "{{#if(map.render)}}<can-import from='can-view-import/test/hello'>" +
				"{{#if isResolved}}{{#with scope.root}}{{#if(map.show)}}{{foo}}{{/if}}" +
				"{{/with}}{{/if}}</can-import>{{/if}}";
			var iai = getIntermediateAndImports(templateString);
			var template = stache(iai.intermediate);
			var map = new SimpleMap({
				render: true,
				show: true,
				bar: "bar"
			});
			var count = 0;
			var foo = new Observation(function(){
				count++;
				equal(count, 1, "This was called too many times");
				return map.get("bar");
			});

			template({ foo: foo, map: map });

			importer("can-view-import/test/hello").then(function(){
				// Get around temporary bind stuff
				setTimeout(function(){
					queues.batch.start();
					map.set("show", false);
					map.set("bar", undefined);
					queues.batch.stop();
					done();
				}, 100);
			});
		});*/
	}

	if (!System.isEnv('production')) {
		QUnit.test("can use an import's value", function(assert) {
            var ready = assert.async();
            var template = "<can-import from='can-view-import/test/person' @value:to='*person' />hello {{*person.name}}";

            var iai = getIntermediateAndImports(template);

            var renderer = stache(iai.intermediate);
            var res = renderer(new SimpleMap());

            importer("can-view-import/test/person").then(function(){
				assert.equal(res.childNodes[2].nodeValue, "world", "Got the person.name from the import");
				ready();
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

					done();
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

					done();
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
				assert.notOk(matched, "importPromise throws a false-positive warning (#83)");
			});

			stache.async(template).then(function(renderer){
				var frag = renderer(new SimpleMap());

				finishWarningCheck();

				importer("can-view-import/test/other.stache").then(function(){
					ok(frag.childNodes[0].childNodes.length > 1, "Something besides a text node is inserted");
					equal(frag.childNodes[0].childNodes[2].firstChild.nodeValue, "hi there", "Partial worked with can-tag");

					done();
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

					done();
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

					done();
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

					done();
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
				assert.ok(/ERROR/i.test(type), "Logged an error that originated from the dynamically imported module");
				done();
			};

			stache.async(template).then(function(renderer){
				renderer({});
			});
		});
	}
	*/

	if (!System.isEnv('production')) {
		QUnit.test("cleaned up correctly when element is removed", function(assert) {
            var ready = assert.async();
            var doc = DOCUMENT();
            var fixture = doc.getElementById("qunit-fixture");
            var template = "<can-import from='can-view-import/test/person' />";
            var iai = getIntermediateAndImports(template);
            var renderer = stache(iai.intermediate);
            var res = renderer(new SimpleMap());
            fixture.appendChild(res);

            importer("can-view-import/test/person").then(function(){
				var el = fixture.querySelector("can-import");
				fixture.removeChild(el);
				// testing that removalDisposal does not throw
				assert.ok(true);
				ready();
			});
        });
	}
}
