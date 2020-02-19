"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var BTreeManager_1 = require("../src/treemanager/BTreeManager");
var fs = require("fs");
var ChildRelation_1 = require("../src/Relations/ChildRelation");
var sourceDirectory = "tests/testdata/";
var sourceFile = "tests/straatnamen20k.txt";
var binaryTreeStringDataLocation = "binary_streets_strings/";
var maxFragmentSize = 100;
var maxCachedFragments = 10000;
var k = 0;
describe('Binary Tree String tests', function () {
    var readLines = fs.readFileSync(sourceFile).toString().split("\n");
    var representations = [];
    var treeManager = new BTreeManager_1.BTreeManager();
    var tree = treeManager.createTree(sourceDirectory, binaryTreeStringDataLocation, "oslo:label", // shacl:path
    maxCachedFragments, maxFragmentSize);
    it('creating new Tree object', function () {
        chai_1.expect(tree.getTreeObject().node_count).to.equal(0);
    });
    var identifier = 0;
    it('adding street names to tree', function () {
        for (var _i = 0, readLines_1 = readLines; _i < readLines_1.length; _i++) {
            var line = readLines_1[_i];
            line = line.trim();
            // Create new Triple object to add to the given tree, containing a representation and an object.
            var dataObject = { "@id": identifier++ };
            // Add the member to the tree.
            tree.addData(line, dataObject);
            representations.push([line, dataObject]);
        }
    });
    it('writing tree object', function () {
        tree.doneAdding();
    });
    var newtree = null;
    it('checking all items to be in the tree', function () {
        newtree = treeManager.readTree(sourceDirectory, binaryTreeStringDataLocation, "oslo:label", // shacl:path
        maxCachedFragments, maxFragmentSize);
        for (var _i = 0, representations_1 = representations; _i < representations_1.length; _i++) {
            var entry = representations_1[_i];
            var identifier_1 = entry[1];
            var rep = entry[0];
            var foundreps = newtree.searchData(rep);
            chai_1.expect(newtree.searchNode(rep).length).gt(0);
            if (foundreps === null) {
                chai_1.expect(false);
            }
            else {
                var found = false;
                for (var i = 0; i < foundreps.length; i++) {
                    var entry_1 = foundreps[i];
                    if (entry_1["@id"] === identifier_1["@id"]) {
                        found = true;
                    }
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
        // TODO:: make this recursive (reads whole tree in memory wel ! best eerst de test op de namen dat de boom weer volledig in memory zit)
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
    // checkRelations(childRelationArray)
    for (var _b = 0, childRelationArray_1 = childRelationArray; _b < childRelationArray_1.length; _b++) {
        var relation = childRelationArray_1[_b];
        chai_1.expect(relation).not.null;
        chai_1.expect(relation.identifier).not.null;
        chai_1.expect(relation.type).not.null;
        chai_1.expect(relation.value).not.null;
    }
    // if (totalItems !== currentNode.get_remainingItems()){
    //   console.log(currentNode.get_children_objects().map( (e:Node) => { return [e.identifier.nodeId, e.remainingItems] }))
    // }
    // console.log(currentNode.get_remainingItems())
    chai_1.expect(totalItems).to.equal(currentNode.get_remainingItems());
}
function checkRelations(relationList) {
    var sortedRelations = relationList.sort(function (rel1, rel2) {
        if (rel1.value === rel2.value) {
            if ((rel1.type === ChildRelation_1.ChildRelation.LesserOrEqualThanRelation || rel1.type === ChildRelation_1.ChildRelation.LesserThanRelation) &&
                (rel2.type === ChildRelation_1.ChildRelation.GreaterThanRelation || rel2.type === ChildRelation_1.ChildRelation.GreaterOrEqualThanRelation)) {
                return -1;
            }
            else if ((rel1.type === ChildRelation_1.ChildRelation.GreaterThanRelation || rel1.type === ChildRelation_1.ChildRelation.GreaterOrEqualThanRelation) &&
                (rel2.type === ChildRelation_1.ChildRelation.LesserOrEqualThanRelation || rel2.type === ChildRelation_1.ChildRelation.LesserThanRelation)) {
                return 1;
            }
            else {
                chai_1.expect(false);
                return 0;
            }
        }
        else {
            if (typeof rel1.value === "string") {
                return rel1.value.localeCompare(rel2.value);
            }
            else {
                return rel1.value - rel2.value;
            }
        }
    });
    for (var i = 0; i < sortedRelations.length - 1; i++) {
        var smallRelation = sortedRelations[i];
        var largeRelation = sortedRelations[i + 1];
        if (smallRelation.value === largeRelation.value) {
            chai_1.expect(smallRelation.type).equals(ChildRelation_1.ChildRelation.LesserOrEqualThanRelation);
            chai_1.expect(largeRelation.type).equals(ChildRelation_1.ChildRelation.GreaterThanRelation);
        }
        else {
            if (typeof smallRelation.value === 'string') {
                chai_1.expect(smallRelation.value.localeCompare(largeRelation.value)).lt(0);
                chai_1.expect(smallRelation.type).equals(ChildRelation_1.ChildRelation.GreaterThanRelation);
                chai_1.expect(largeRelation.type).equals(ChildRelation_1.ChildRelation.LesserOrEqualThanRelation);
            }
            else {
                chai_1.expect(smallRelation.value).lt(largeRelation.value);
                chai_1.expect(smallRelation.type).equals(ChildRelation_1.ChildRelation.GreaterThanRelation);
                chai_1.expect(largeRelation.type).equals(ChildRelation_1.ChildRelation.LesserOrEqualThanRelation);
            }
        }
    }
}
//# sourceMappingURL=btreestrings.test.js.map