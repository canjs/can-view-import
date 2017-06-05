/*can-view-import@3.0.7#can-view-import*/
define(function (require, exports, module) {
    var assign = require('can-util/js/assign');
    var canData = require('can-util/dom/data');
    var DOCUMENT = require('can-util/dom/document');
    var getChildNodes = require('can-util/dom/child-nodes');
    var importer = require('can-util/js/import');
    var mutate = require('can-util/dom/mutate');
    var nodeLists = require('can-view-nodelist');
    var tag = require('can-view-callbacks').tag;
    var events = require('can-event');
    var canLog = require('can-util/js/log');
    tag('can-import', function (el, tagData) {
        var moduleName = el.getAttribute('from');
        var templateModule = tagData.options.get('helpers.module');
        var parentName = templateModule ? templateModule.id : undefined;
        if (!moduleName) {
            return Promise.reject('No module name provided');
        }
        var importPromise = importer(moduleName, parentName);
        importPromise.catch(function (err) {
            canLog.error(err);
        });
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
            var frag = tagData.subtemplate ? tagData.subtemplate(scope, tagData.options) : DOCUMENT().createDocumentFragment();
            var nodeList = nodeLists.register([], undefined, tagData.parentNodeList || true);
            nodeList.expression = '<can-import>';
            events.one.call(el, 'removed', function () {
                nodeLists.unregister(nodeList);
            });
            mutate.appendChild.call(el, frag);
            nodeLists.update(nodeList, getChildNodes(el));
        }
    });
});