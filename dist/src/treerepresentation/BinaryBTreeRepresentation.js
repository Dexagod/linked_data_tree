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
var TreeRepresentation_1 = require("./TreeRepresentation");
var BinaryBTree_1 = require("../Tree/BinaryBTree");
var Member_1 = require("../DataObjects/Member");
var BinaryBTreeRepresentation = /** @class */ (function (_super) {
    __extends(BinaryBTreeRepresentation, _super);
    function BinaryBTreeRepresentation() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BinaryBTreeRepresentation.prototype.createNewTreeObject = function (maxFragmentSize, fc) {
        return new BinaryBTree_1.BinaryBTree(maxFragmentSize, fc);
    };
    BinaryBTreeRepresentation.prototype.addData = function (representation, data, dataRepresentation) {
        if (dataRepresentation === void 0) { dataRepresentation = representation; }
        return this.tree.addData(representation, new Member_1.Member(dataRepresentation, data));
    };
    return BinaryBTreeRepresentation;
}(TreeRepresentation_1.TreeRepresentation));
exports.BinaryBTreeRepresentation = BinaryBTreeRepresentation;
//# sourceMappingURL=BinaryBTreeRepresentation.js.map