"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Cache_1 = require("../Cache/Cache");
var Member_1 = require("../DataObjects/Member");
var TreeRepresentation = /** @class */ (function () {
    function TreeRepresentation(tree, sourceDirectory, dataFolder, maxCachedFragments, maxFragmentSize, nodeIO) {
        if (tree === undefined || tree === null) {
            var fc = new Cache_1.Cache(sourceDirectory, dataFolder, maxCachedFragments, nodeIO);
            this.tree = this.createNewTreeObject(maxFragmentSize, fc);
        }
        else {
            this.tree = tree;
        }
        this.sourceDirectory = sourceDirectory;
        this.dataFolder = dataFolder;
    }
    /**
     * Add given data to the tree in the node of the representation.
     * @param {string} representation
     * @param {any} data
     */
    TreeRepresentation.prototype.addData = function (representation, data, dataRepresentation) {
        if (dataRepresentation === void 0) { dataRepresentation = representation; }
        var newmember = new Member_1.Member(dataRepresentation, data);
        this.tree.addData(representation, newmember);
    };
    TreeRepresentation.prototype.searchData = function (value) {
        return this.tree.searchData(value);
    };
    TreeRepresentation.prototype.searchNode = function (value) {
        return this.tree.searchNode(value);
    };
    /**
     * Indicate finished adding data.
     * Cache can be flushed.
     */
    TreeRepresentation.prototype.doneAdding = function (writeToFile) {
        if (writeToFile === void 0) { writeToFile = true; }
        return this.tree.get_cache().flush_cache(this.getTreeObject());
    };
    TreeRepresentation.prototype.getTreeObject = function () {
        return this.tree;
    };
    return TreeRepresentation;
}());
exports.TreeRepresentation = TreeRepresentation;
//# sourceMappingURL=TreeRepresentation.js.map