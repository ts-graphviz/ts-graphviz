"use strict";
exports.__esModule = true;
exports.useClusterAttributes = void 0;
var react_1 = require("react");
function useClusterAttributes(cluster, attributes, _a) {
    var edge = _a.edge, node = _a.node, graph = _a.graph;
    (0, react_1.useEffect)(function () {
        cluster.clear();
        cluster.apply(attributes);
    }, [cluster, attributes]);
    (0, react_1.useEffect)(function () {
        cluster.attributes.node.clear();
        cluster.attributes.node.apply(node !== null && node !== void 0 ? node : {});
    }, [cluster, node]);
    (0, react_1.useEffect)(function () {
        cluster.attributes.edge.clear();
        cluster.attributes.edge.apply(edge !== null && edge !== void 0 ? edge : {});
    }, [cluster, edge]);
    (0, react_1.useEffect)(function () {
        cluster.attributes.graph.clear();
        cluster.attributes.graph.apply(graph !== null && graph !== void 0 ? graph : {});
    }, [cluster, graph]);
}
exports.useClusterAttributes = useClusterAttributes;
