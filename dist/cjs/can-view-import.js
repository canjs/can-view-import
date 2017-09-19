/*can-view-import@3.1.0#can-view-import*/
var assign = require('can-util/js/assign/assign');
var canData = require('can-util/dom/data/data');
var DOCUMENT = require('can-util/dom/document/document');
var getChildNodes = require('can-util/dom/child-nodes/child-nodes');
var importer = require('can-util/js/import/import');
var mutate = require('can-util/dom/mutate/mutate');
var nodeLists = require('can-view-nodelist');
var tag = require('can-view-callbacks').tag;
var events = require('can-event');
var canLog = require('can-util/js/log/log');
function processImport(el, tagData) {
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
        nodeList.expression = '<' + this.tagName + '>';
        events.one.call(el, 'removed', function () {
            nodeLists.unregister(nodeList);
        });
        mutate.appendChild.call(el, frag);
        nodeLists.update(nodeList, getChildNodes(el));
    }
}
[
    'can-import',
    'can-dynamic-import'
].forEach(function (tagName) {
    tag(tagName, processImport.bind({ tagName: tagName }));
});