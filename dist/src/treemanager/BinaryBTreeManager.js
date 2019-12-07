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
var BinaryBTreeRepresentation_1 = require("../treerepresentation/BinaryBTreeRepresentation");
var BinaryBTree_1 = require("../Tree/BinaryBTree");
var BinaryBTreeManager = /** @class */ (function (_super) {
    __extends(BinaryBTreeManager, _super);
    function BinaryBTreeManager() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BinaryBTreeManager.prototype.createTreeRepresentation = function (tree, sourceDirectory, dataFolder, maxCachedFragments, maxFragmentSize, nodeIO) {
        return new BinaryBTreeRepresentation_1.BinaryBTreeRepresentation(tree, sourceDirectory, dataFolder, maxCachedFragments, maxFragmentSize, nodeIO);
    };
    BinaryBTreeManager.prototype.getTreeObjectPrototype = function () {
        return BinaryBTree_1.BinaryBTree;
    };
    return BinaryBTreeManager;
}(TreeManager_1.TreeManager));
exports.BinaryBTreeManager = BinaryBTreeManager;
//# sourceMappingURL=BinaryBTreeManager.js.map