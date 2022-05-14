"use strict";
exports.__esModule = true;
exports.useRootCluster = void 0;
var react_1 = require("react");
var RootCluster_1 = require("../components/contexts/RootCluster");
function useRootCluster() {
    return (0, react_1.useContext)(RootCluster_1.RootCluster);
}
exports.useRootCluster = useRootCluster;
