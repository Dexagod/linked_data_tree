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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var TreeRepresentation_1 = require("./TreeRepresentation");
var RTree_1 = require("../Tree/RTree");
var Member_1 = require("../DataObjects/Member");
var terraformer_parser = __importStar(require("terraformer-wkt-parser"));
var RTreeRepresentation = /** @class */ (function (_super) {
    __extends(RTreeRepresentation, _super);
    function RTreeRepresentation() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RTreeRepresentation.prototype.createNewTreeObject = function (maxFragmentSize, fc) {
        return new RTree_1.RTree(maxFragmentSize, fc);
    };
    RTreeRepresentation.prototype.addData = function (representation, data, dataRepresentation) {
        if (dataRepresentation === void 0) { dataRepresentation = representation; }
        representation = terraformer_parser.parse(representation);
        dataRepresentation = terraformer_parser.parse(dataRepresentation);
        var newmember = new Member_1.Member(dataRepresentation, data);
        this.tree.addData(representation, newmember);
    };
    return RTreeRepresentation;
}(TreeRepresentation_1.TreeRepresentation));
exports.RTreeRepresentation = RTreeRepresentation;
//# sourceMappingURL=RTreeRepresentation.js.map