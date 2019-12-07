"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var TreeManager_1 = require("./TreeManager");
var RTreeRepresentation_1 = require("../treerepresentation/RTreeRepresentation");
var RTree_1 = require("../Tree/RTree");
var WKTNodeIO_1 = require("../IO/WKTNodeIO");
/**
 * options {
 *    sourceDirectory
 *    dataFolder
 *    maxFragmentSize
 *    maxCachedFragments
 *    }
 */
var RTreeManager = /** @class */ (function (_super) {
    __extends(RTreeManager, _super);
    function RTreeManager() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RTreeManager.prototype.createTreeRepresentation = function (tree, sourceDirectory, dataFolder, maxCachedFragments, maxFragmentSize, nodeIO) {
        return new RTreeRepresentation_1.RTreeRepresentation(tree, sourceDirectory, dataFolder, maxCachedFragments, maxFragmentSize, nodeIO);
    };
    RTreeManager.prototype.getTreeObjectPrototype = function () {
        return RTree_1.RTree;
    };
    RTreeManager.prototype.getNodeIOObject = function (sourceDirectory, dataFolder, nodePath) {
        return new WKTNodeIO_1.WKTNodeIO(sourceDirectory, dataFolder, nodePath);
    };
    return RTreeManager;
}(TreeManager_1.TreeManager));
exports.RTreeManager = RTreeManager;
//# sourceMappingURL=RTreeManager.js.map