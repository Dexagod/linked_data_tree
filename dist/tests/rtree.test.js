"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var RTreeManager_1 = require("../src/treemanager/RTreeManager");
var sourceDirectory = "tests/testdata/";
var sourceFile = "tests/straatnamen20k.txt";
var maxFragmentSize = 100;
var maxCachedFragments = 10000;
var RTreeStringDataLocation = "rtree_streets/";
describe('RTree tests', function () {
    var representations = [];
    var treeManager = new RTreeManager_1.RTreeManager();
    var tree = treeManager.createTree(sourceDirectory, RTreeStringDataLocation, "oslo:label", // shacl:path
    maxCachedFragments, maxFragmentSize);
    it('creating new Tree object', function () {
        chai_1.expect(tree.getTreeObject().node_count).to.equal(0);
    });
    var identifier = 0;
    it('adding street names to tree', function () {
        // for (let line of readLines) {
        for (var index = 0; index < 2000; index++) {
            // Create new Triple object to add to the given tree, containing a representation and an object.
            var long = Math.random() * 50;
            var lat = Math.random() * 50;
            var representation = "POINT (" + lat + " " + long + ")";
            // Add the member to the tree.
            var dataObject = { "@id": identifier++ };
            tree.addData(representation, dataObject);
            representations.push([representation, dataObject]);
        }
    });
    it('writing tree object', function () {
        tree.doneAdding();
    });
    var newtree = null;
    it('checking all items to be in the tree', function () {
        newtree = treeManager.readTree(sourceDirectory, RTreeStringDataLocation, "oslo:label", // shacl:path
        maxCachedFragments, maxFragmentSize);
        if (newtree === null) {
            throw new Error("reading the tree items resulted in a null tree object.");
        }
        for (var _i = 0, representations_1 = representations; _i < representations_1.length; _i++) {
            var entry = representations_1[_i];
            var rep = entry[0];
            var dataObject = entry[1];
            var foundreps = newtree.searchData(rep);
            if (foundreps === null) {
                chai_1.expect(false);
            }
            else {
                var found = false;
                // 
                for (var i = 0; i < foundreps.length; i++) {
                    var item = foundreps[i];
                    if (item["@id"] === dataObject["@id"]) {
                        found = true;
                    }
                }
                if (found === false) {
                }
                chai_1.expect(found).equals(true);
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
    if (currentNode.has_child_relations() === false) {
        if (rootNodeDepth === null) {
            rootNodeDepth = depth;
        }
        else {
            chai_1.expect(rootNodeDepth).equals(depth);
        }
    }
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
    chai_1.expect(totalItems).to.equal(currentNode.get_remainingItems());
}
//# sourceMappingURL=rtree.test.js.map