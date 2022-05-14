"use strict";
exports.__esModule = true;
exports.useHasComment = void 0;
var react_1 = require("react");
function useHasComment(target, comment) {
    (0, react_1.useEffect)(function () {
        // eslint-disable-next-line no-param-reassign
        target.comment = comment;
    }, [target, comment]);
}
exports.useHasComment = useHasComment;
