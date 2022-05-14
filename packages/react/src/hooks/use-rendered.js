"use strict";
exports.__esModule = true;
exports.useRendered = void 0;
var react_1 = require("react");
var useRendered = function (dot, engine, format, ext) {
    var _a = (0, react_1.useState)(), rendered = _a[0], setRendered = _a[1];
    var graphviz = (0, react_1.useMemo)(function () { return Promise.resolve().then(function () { return require('@hpcc-js/wasm'); }).then(function (wasm) { return wasm.graphviz; }); }, []);
    (0, react_1.useEffect)(function () {
        graphviz.then(function (gv) { return gv.layout(dot, format, engine, ext); }).then(setRendered);
    }, [dot, engine, format, ext, setRendered, graphviz]);
    return rendered;
};
exports.useRendered = useRendered;
