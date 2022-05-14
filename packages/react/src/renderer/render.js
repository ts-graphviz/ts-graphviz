"use strict";
exports.__esModule = true;
exports.renderToDot = exports.render = void 0;
var react_1 = require("react");
var ts_graphviz_1 = require("ts-graphviz");
var GraphvizContext_1 = require("../components/contexts/GraphvizContext");
var reconciler_1 = require("./reconciler");
var ClusterMap_1 = require("../components/contexts/ClusterMap");
var noop = function () { return undefined; };
function render(element, context) {
    var container = reconciler_1.reconciler.createContainer({}, false, false);
    // Clusters
    return reconciler_1.reconciler.updateContainer((0, react_1.createElement)(ClusterMap_1.ClusterMap.Provider, {
        value: new Map()
    }, (0, react_1.createElement)(GraphvizContext_1.GraphvizContext.Provider, {
        value: context
    }, element)), container, null, noop);
}
exports.render = render;
function renderToDot(element) {
    var context = {};
    render(element, context);
    return context.root ? (0, ts_graphviz_1.toDot)(context.root) : '';
}
exports.renderToDot = renderToDot;
