"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var PrefixTreeManager_1 = require("../src/treemanager/PrefixTreeManager");
var fs = require("fs");
var sourceDirectory = "tests/testdata/";
var sourceFile = "tests/straatnamen20k.txt";
var maxFragmentSize = 100;
var maxCachedFragments = 10000;
var prefixTreeStringDataLocation = "prefix_streets/";
describe('Prefix Tree tests', function () {
    var readLines = fs.readFileSync(sourceFile).toString().split("\n");
    var treeManager = new PrefixTreeManager_1.PrefixTreeManager();
    var tree = treeManager.createTree(sourceDirectory, prefixTreeStringDataLocation, "oslo:label", // shacl:path
    maxCachedFragments, maxFragmentSize);
    it('creating new Tree object', function () {
        chai_1.expect(tree.getTreeObject().node_count).to.equal(0);
    });
    var identifier = 0;
    var representations = new Array();
    it('adding street names to tree', function () {
        for (var _i = 0, readLines_1 = readLines; _i < readLines_1.length; _i++) {
            var line = readLines_1[_i];
            // Create new Triple object to add to the given tree, containing a representation and an object.
            var dataObject = { "@id": identifier++ };
            tree.addData(line, dataObject);
            representations.push([line, dataObject]);
        }
    });
    it('writing tree object', function () {
        tree.doneAdding();
    });
    var newtree = null;
    it('checking all items to be in the tree', function () {
        newtree = treeManager.readTree(sourceDirectory, prefixTreeStringDataLocation, "oslo:label", // shacl:path
        maxCachedFragments, maxFragmentSize);
        if (newtree === null) {
            throw new Error("reading the tree items resulted in a null tree object.");
        }
        for (var _i = 0, representations_1 = representations; _i < representations_1.length; _i++) {
            var entry = representations_1[_i];
            var identifier_1 = entry[1];
            var line = entry[0];
            var representations_2 = newtree.searchData(line);
            chai_1.expect(newtree.searchNode(line).length).gte(1);
            if (representations_2 === null) {
                console.error("null prepresentations");
                chai_1.expect(false);
            }
            else {
                // expect( representations.map(e => e.get_representation()).indexOf(line) ).to.not.equal( -1 ) }
                if (representations_2 === null) {
                    chai_1.expect(false);
                }
                else {
                    var found = false;
                    for (var i = 0; i < representations_2.length; i++) {
                        var entry_1 = representations_2[i];
                        if (entry_1["@id"] === identifier_1["@id"]) {
                            found = true;
                        }
                    }
                    chai_1.expect(found).equals(true);
                }
            }
        }
    });
    it('checking total children count in each node to be the sum of the child items ', function () {
        if (newtree === null) {
            throw new Error("reading the tree items resulted in a null tree object.");
        }
        var rootNode = newtree.getTreeObject().get_root_node();
        checkItems(rootNode, 0);
    });
});
var rootNodeDepth = null;
function checkItems(currentNode, depth) {
    var totalItems = 0;
    for (var _i = 0, _a = currentNode.get_children_objects(); _i < _a.length; _i++) {
        var child = _a[_i];
        totalItems += child.get_remainingItems();
        checkItems(child, depth + 1);
    }
    totalItems += currentNode.get_members().length;
    var childRelationArray = currentNode.children;
    for (var _b = 0, childRelationArray_1 = childRelationArray; _b < childRelationArray_1.length; _b++) {
        var relation = childRelationArray_1[_b];
        chai_1.expect(relation).not.null;
        chai_1.expect(relation.identifier).not.null;
        chai_1.expect(relation.type).not.null;
        chai_1.expect(relation.value).not.null;
    }
    if (totalItems != currentNode.get_remainingItems()) {
        delete currentNode["fc"];
        console.log("ERROR", JSON.stringify(currentNode, null, 2));
    }
    chai_1.expect(totalItems).to.equal(currentNode.get_remainingItems());
}
//# sourceMappingURL=prefixtree.test.js.map