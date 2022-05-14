"use strict";
exports.__esModule = true;
exports.useGraphvizContext = void 0;
var react_1 = require("react");
var GraphvizContext_1 = require("../components/contexts/GraphvizContext");
var errors_1 = require("../utils/errors");
function useGraphvizContext() {
    var context = (0, react_1.useContext)(GraphvizContext_1.GraphvizContext);
    if (context === null) {
        throw Error(errors_1.NoGraphvizContextErrorMessage);
    }
    return context;
}
exports.useGraphvizContext = useGraphvizContext;
