"use strict";
exports.__esModule = true;
exports.renderId = void 0;
var react_1 = require("react");
var server_1 = require("react-dom/server");
function renderId(id) {
    if ((0, react_1.isValidElement)(id)) {
        var htmlLike = (0, server_1.renderToStaticMarkup)(id)
            .replace(/<dot-port>(.+?)<\/dot-port>/gi, '<$1>')
            .replace(/<(\/?)dot-([a-z-]+)/gi, function (_, $1, $2) { return "<".concat($1).concat($2.toUpperCase()); });
        return "<".concat(htmlLike, ">");
    }
    return id;
}
exports.renderId = renderId;
