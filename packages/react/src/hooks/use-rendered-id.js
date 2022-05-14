"use strict";
exports.__esModule = true;
exports.useRenderedID = void 0;
var react_1 = require("react");
var render_id_1 = require("../utils/render-id");
function useRenderedID(id) {
    return (0, react_1.useMemo)(function () { return (0, render_id_1.renderId)(id); }, [id]);
}
exports.useRenderedID = useRenderedID;
