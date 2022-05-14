"use strict";
exports.__esModule = true;
exports.reconciler = exports.HostConfig = void 0;
var react_reconciler_1 = require("react-reconciler");
var HostConfig = /** @class */ (function () {
    function HostConfig() {
        this.now = Date.now;
        this.setTimeout = setTimeout;
        this.clearTimeout = clearTimeout;
        this.noTimeout = -1; // TODO
        // Temporary workaround for scenario where multiple renderers concurrently
        // render using the same context objects. E.g. React DOM and React ART on the
        // same page. DOM is the primary renderer; ART is the secondary renderer.
        this.isPrimaryRenderer = false;
        this.supportsMutation = false;
        this.supportsPersistence = false;
        this.supportsHydration = false;
    }
    HostConfig.prototype.getPublicInstance = function (instance) {
        return instance;
    };
    HostConfig.prototype.getRootHostContext = function (rootContainerInstance) {
        return {};
    };
    HostConfig.prototype.getChildHostContext = function (parentHostContext, type, rootContainerInstance) {
        return parentHostContext;
    };
    HostConfig.prototype.prepareForCommit = function (containerInfo) {
        // NoOp
    };
    HostConfig.prototype.resetAfterCommit = function (containerInfo) {
        // containerInfo.setRoot
    };
    /**
     * Create component instance
     */
    HostConfig.prototype.createInstance = function (type, props, rootContainerInstance, hostContext, internalInstanceHandle) {
        // NoOp
        return type(props);
    };
    HostConfig.prototype.appendInitialChild = function (parentInstance, child) {
        parentInstance.appendChild(child);
    };
    HostConfig.prototype.finalizeInitialChildren = function (parentInstance, type, props, rootContainerInstance, hostContext) {
        return false;
    };
    HostConfig.prototype.prepareUpdate = function (instance, type, oldProps, newProps, rootContainerInstance, hostContext) {
        return {};
    };
    HostConfig.prototype.shouldSetTextContent = function (type, props) {
        return false;
    };
    HostConfig.prototype.shouldDeprioritizeSubtree = function (type, props) {
        return false;
    };
    HostConfig.prototype.createTextInstance = function (text, rootContainerInstance, hostContext, internalInstanceHandle) {
        return text;
    };
    HostConfig.prototype.scheduleDeferredCallback = function (callback, options) {
        // NoOp
    };
    HostConfig.prototype.cancelDeferredCallback = function (callbackID) {
        // NoOp
    };
    // -------------------
    //      Mutation
    //     (optional)
    // -------------------
    HostConfig.prototype.appendChild = function (parentInstance, child) {
        // NoOp
        if (parentInstance.appendChild) {
            parentInstance.appendChild(child);
        }
    };
    HostConfig.prototype.appendChildToContainer = function (container, child) {
        // if (container.appendChild) {
        //   container.appendChild(child);
        // }
    };
    HostConfig.prototype.commitTextUpdate = function (textInstance, oldText, newText) {
        // NoOp
    };
    HostConfig.prototype.commitMount = function (instance, type, newProps, internalInstanceHandle) {
        // NoOp
    };
    HostConfig.prototype.commitUpdate = function (instance, updatePayload, type, oldProps, newProps, internalInstanceHandle) {
        // NoOp
    };
    HostConfig.prototype.insertBefore = function (parentInstance, child, beforeChild) {
        // NoOp
    };
    HostConfig.prototype.insertInContainerBefore = function (container, child, beforeChild) {
        // NoOp
    };
    HostConfig.prototype.removeChild = function (parentInstance, child) {
        // NoOp
    };
    HostConfig.prototype.removeChildFromContainer = function (container, child) {
        // NoOp
    };
    HostConfig.prototype.resetTextContent = function (instance) {
        // NoOp
    };
    return HostConfig;
}());
exports.HostConfig = HostConfig;
exports.reconciler = (0, react_reconciler_1["default"])(new HostConfig());
