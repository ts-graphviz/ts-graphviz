"use strict";
exports.__esModule = true;
exports.useHasAttributes = void 0;
var react_1 = require("react");
function useHasAttributes(target, attributes) {
    (0, react_1.useEffect)(function () {
        target.attributes.clear();
        target.attributes.apply(attributes);
    }, [target, attributes]);
}
exports.useHasAttributes = useHasAttributes;
