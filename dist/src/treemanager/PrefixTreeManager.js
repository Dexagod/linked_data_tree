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
var PrefixTree_1 = require("../Tree/PrefixTree");
var TreeManager_1 = require("./TreeManager");
var PrefixTreeRepresenatation_1 = require("../treerepresentation/PrefixTreeRepresenatation");
var PrefixTreeManager = /** @class */ (function (_super) {
    __extends(PrefixTreeManager, _super);
    function PrefixTreeManager() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PrefixTreeManager.prototype.createTreeRepresentation = function (tree, sourceDirectory, dataFolder, maxCachedFragments, maxFragmentSize, nodeIO) {
        return new PrefixTreeRepresenatation_1.PrefixTreeRepresentation(tree, sourceDirectory, dataFolder, maxCachedFragments, maxFragmentSize, nodeIO);
    };
    PrefixTreeManager.prototype.getTreeObjectPrototype = function () {
        return PrefixTree_1.PrefixTree;
    };
    return PrefixTreeManager;
}(TreeManager_1.TreeManager));
exports.PrefixTreeManager = PrefixTreeManager;
//# sourceMappingURL=PrefixTreeManager.js.map