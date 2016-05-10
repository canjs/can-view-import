/*can-view-import@3.0.0-pre.0#can-view-import*/
define(function (require, exports, module) {
    var assign = require('can-util/js/assign');
    var canData = require('can-util/dom/data');
    var isFunction = require('can-util/js/is-function');
    var importer = require('can-util/js/import');
    var nodeLists = require('can-view-nodelist');
    var tag = require('can-view-callbacks').tag;
    var events = require('can-event');
    tag('can-import', function (el, tagData) {
        var moduleName = el.getAttribute('from');
        var templateModule = tagData.options.attr('helpers.module');
        var parentName = templateModule ? templateModule.id : undefined;
        if (!moduleName) {
            return Promise.reject('No module name provided');
        }
        var importPromise = importer(moduleName, parentName);
        var root = tagData.scope.attr('%root');
        if (root && isFunction(root.waitFor)) {
            root.waitFor(importPromise);
        }
        canData.set.call(el, 'viewModel', importPromise);
        canData.set.call(el, 'scope', importPromise);
        var scope = tagData.scope.add(importPromise);
        var handOffTag = el.getAttribute('can-tag');
        if (handOffTag) {
            var callback = tag(handOffTag);
            canData.set.call(el, 'preventDataBindings', true);
            callback(el, assign(tagData, { scope: scope }));
            canData.set.call(el, 'preventDataBindings', false);
            canData.set.call(el, 'viewModel', importPromise);
            canData.set.call(el, 'scope', importPromise);
        } else {
            var frag = tagData.subtemplate ? tagData.subtemplate(scope, tagData.options) : document.createDocumentFragment();
            var nodeList = nodeLists.register([], undefined, true);
            events.one.call(el, 'removed', function () {
                nodeLists.unregister(nodeList);
            });
            el.appendChild(frag);
            nodeLists.update(nodeList, el.childNodes);
        }
    });
});