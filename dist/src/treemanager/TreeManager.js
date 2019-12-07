"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NodeIO_1 = require("../IO/NodeIO");
var TreeManager = /** @class */ (function () {
    function TreeManager() {
        this.nodeIO = null;
    }
    /**
     * Gets the tree object from the given location.
     * @param {string} sourceDirectory - base folder of the tree data
     * @param {*} dataFolder - folder containing the fragment files in the sourceDirectory
     * @param {*} maxCachedFragments - maximal cachable fragments at once
     */
    TreeManager.prototype.readTree = function (sourceDirectory, dataFolder, nodeShaclPath, maxCachedFragments, maxFragmentSize) {
        var nodeIO = this.getNodeIO(sourceDirectory, dataFolder, nodeShaclPath);
        var tree = nodeIO.readTree(this.getTreeObjectPrototype());
        return this.createTreeRepresentation(tree, sourceDirectory, dataFolder, maxCachedFragments, maxFragmentSize, nodeIO);
    };
    /**
     * Creates a new tree object.
     * @param {string} sourceDirectory - base forlder of the tree data
     * @param {string} dataFolder - folder containing the fragment files in the sourceDirectory
     * @param {number} maxCachedFragments - the maximal amount of elements in the cache
     */
    TreeManager.prototype.createTree = function (sourceDirectory, dataFolder, nodeShaclPath, maxCachedFragments, maxFragmentSize) {
        return this.createTreeRepresentation(null, sourceDirectory, dataFolder, maxCachedFragments, maxFragmentSize, this.getNodeIO(sourceDirectory, dataFolder, nodeShaclPath));
    };
    TreeManager.prototype.getNodeIO = function (sourceDirectory, dataFolder, nodePath) {
        return this.getNodeIOObject(sourceDirectory, dataFolder, nodePath);
    };
    TreeManager.prototype.getNodeIOObject = function (sourceDirectory, dataFolder, nodePath) {
        return new NodeIO_1.NodeIO(sourceDirectory, dataFolder, nodePath);
    };
    return TreeManager;
}());
exports.TreeManager = TreeManager;
//# sourceMappingURL=TreeManager.js.map