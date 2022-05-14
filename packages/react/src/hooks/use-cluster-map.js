"use strict";
exports.__esModule = true;
exports.useClusterMap = void 0;
var react_1 = require("react");
var ClusterMap_1 = require("../components/contexts/ClusterMap");
function useClusterMap() {
    return (0, react_1.useContext)(ClusterMap_1.ClusterMap);
}
exports.useClusterMap = useClusterMap;
