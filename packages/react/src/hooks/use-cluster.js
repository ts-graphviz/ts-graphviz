"use strict";
exports.__esModule = true;
exports.useCluster = void 0;
var react_1 = require("react");
var Cluster_1 = require("../components/contexts/Cluster");
var errors_1 = require("../utils/errors");
function useCluster() {
    var cluster = (0, react_1.useContext)(Cluster_1.Cluster);
    if (cluster === null) {
        throw Error(errors_1.NoClusterErrorMessage);
    }
    return cluster;
}
exports.useCluster = useCluster;
