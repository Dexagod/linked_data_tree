"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Identifier = /** @class */ (function () {
    function Identifier(nodeId, value) {
        this.nodeId = nodeId;
        this.value = value;
    }
    Identifier.prototype.equals = function (identifier) {
        return (identifier.nodeId === this.nodeId);
    };
    return Identifier;
}());
exports.Identifier = Identifier;
//# sourceMappingURL=Identifier.js.map