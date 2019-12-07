"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Member = /** @class */ (function () {
    /**
     * Creates a data object in the tree with a given representation.
     * @param {string} representation
     * @param {any} contents
     */
    function Member(representation, contents) {
        if (contents === void 0) { contents = null; }
        this.representation = representation;
        this.contents = contents;
    }
    /**
     * returns the representation of this data object.
    */
    Member.prototype.get_representation = function () {
        return this.representation;
    };
    return Member;
}());
exports.Member = Member;
//# sourceMappingURL=Member.js.map