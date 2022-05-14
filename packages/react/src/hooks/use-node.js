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
exports.useNode = void 0;
var react_1 = require("react");
var use_cluster_1 = require("./use-cluster");
var use_comment_1 = require("./use-comment");
var use_has_attributes_1 = require("./use-has-attributes");
function useNode(_a) {
    var id = _a.id, comment = _a.comment, attributes = __rest(_a, ["id", "comment"]);
    var cluster = (0, use_cluster_1.useCluster)();
    var node = (0, react_1.useMemo)(function () {
        var n = cluster.createNode(id);
        n.attributes.apply(attributes);
        n.comment = comment;
        return n;
    }, [cluster, id, attributes, comment]);
    (0, use_comment_1.useHasComment)(node, comment);
    (0, use_has_attributes_1.useHasAttributes)(node, attributes);
    (0, react_1.useEffect)(function () {
        return function () {
            cluster.removeNode(node);
        };
    }, [cluster, node]);
    return node;
}
exports.useNode = useNode;
