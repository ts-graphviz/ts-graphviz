"use strict";
exports.__esModule = true;
exports.RootCluster = exports.NoRootCluster = void 0;
var react_1 = require("react");
exports.NoRootCluster = {};
exports.RootCluster = react_1["default"].createContext(exports.NoRootCluster);
exports.RootCluster.displayName = 'RootCluster';
