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
var NodeIO_1 = require("./NodeIO");
var terraformer_parser = __importStar(require("terraformer-wkt-parser"));
var WKTNodeIO = /** @class */ (function (_super) {
    __extends(WKTNodeIO, _super);
    function WKTNodeIO() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    WKTNodeIO.prototype.encode_node_value = function (a) {
        return terraformer_parser.convert(a);
    };
    WKTNodeIO.prototype.decode_node_value = function (a) {
        return terraformer_parser.parse(a);
    };
    WKTNodeIO.prototype.encode_tdo_value = function (a) {
        return terraformer_parser.convert(a);
    };
    WKTNodeIO.prototype.decode_tdo_value = function (a) {
        return terraformer_parser.parse(a);
    };
    return WKTNodeIO;
}(NodeIO_1.NodeIO));
exports.WKTNodeIO = WKTNodeIO;
//# sourceMappingURL=WKTNodeIO.js.map