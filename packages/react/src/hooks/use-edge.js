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
exports.useEdge = void 0;
var react_1 = require("react");
var use_cluster_1 = require("./use-cluster");
var errors_1 = require("../utils/errors");
var use_comment_1 = require("./use-comment");
var use_has_attributes_1 = require("./use-has-attributes");
function useEdge(_a) {
    var targets = _a.targets, comment = _a.comment, attributes = __rest(_a, ["targets", "comment"]);
    var cluster = (0, use_cluster_1.useCluster)();
    if (targets.length < 2) {
        throw Error(errors_1.EdgeTargetLengthErrorMessage);
    }
    var edge = (0, react_1.useMemo)(function () {
        var e = cluster.createEdge(targets);
        e.comment = comment;
        e.attributes.apply(attributes);
        return e;
    }, [cluster, targets, comment, attributes]);
    (0, use_comment_1.useHasComment)(edge, comment);
    (0, use_has_attributes_1.useHasAttributes)(edge, attributes);
    (0, react_1.useEffect)(function () {
        return function () {
            cluster.removeEdge(edge);
        };
    }, [cluster, edge]);
    return edge;
}
exports.useEdge = useEdge;
