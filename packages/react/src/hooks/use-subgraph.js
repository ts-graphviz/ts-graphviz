"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
exports.useSubgraph = void 0;
var react_1 = require("react");
var use_cluster_1 = require("./use-cluster");
var use_cluster_attributes_1 = require("./use-cluster-attributes");
var use_comment_1 = require("./use-comment");
function useSubgraph(_a) {
    if (_a === void 0) { _a = {}; }
    var id = _a.id, comment = _a.comment, edge = _a.edge, node = _a.node, graph = _a.graph, attributes = __rest(_a, ["id", "comment", "edge", "node", "graph"]);
    var cluster = (0, use_cluster_1.useCluster)();
    var subgraph = (0, react_1.useMemo)(function () {
        var g = cluster.createSubgraph(id);
        g.comment = comment;
        g.apply(attributes);
        g.attributes.node.apply(node !== null && node !== void 0 ? node : {});
        g.attributes.edge.apply(edge !== null && edge !== void 0 ? edge : {});
        g.attributes.graph.apply(graph !== null && graph !== void 0 ? graph : {});
        return g;
    }, [cluster, id, comment, edge, node, graph, attributes]);
    (0, use_comment_1.useHasComment)(subgraph, comment);
    (0, use_cluster_attributes_1.useClusterAttributes)(subgraph, attributes, { edge: edge, node: node, graph: graph });
    (0, react_1.useEffect)(function () {
        return function () {
            cluster.removeSubgraph(subgraph);
        };
    }, [cluster, subgraph]);
    return subgraph;
}
exports.useSubgraph = useSubgraph;
