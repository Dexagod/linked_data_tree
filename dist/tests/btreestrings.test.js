"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var BinaryBTreeManager_1 = require("../src/treemanager/BinaryBTreeManager");
var ttl2jsonld = require('@frogcat/ttl2jsonld').parse;
var fs = require("fs");
var ChildRelation_1 = require("../src/Relations/ChildRelation");
var sourceDirectory = "tests/testdata/";
var sourceFile = "tests/straatnamen20k.txt";
var binaryTreeStringDataLocation = "binary_streets/";
var binaryTreeStringLocation = "binary_collections/";
var binaryTreeStringFile = "binary_streetnames";
var maxFragmentSize = 50; // 100
var maxCachedFragments = 10000;
// Read input file
describe('Binary Tree String tests', function () {
    var readLines = fs.readFileSync(sourceFile).toString().split("\n");
    var representations = [];
    var treeManager = new BinaryBTreeManager_1.BinaryBTreeManager();
    var tree = treeManager.createTree(sourceDirectory, binaryTreeStringDataLocation, "oslo:label", // shacl:path
    maxCachedFragments, maxFragmentSize);
    it('creating new Tree object', function () {
        chai_1.expect(tree.getTreeObject().node_count).to.equal(0);
    });
    var count = 0;
    it('Adding a single item to tree', function () {
        var long = 10; //(Math.random() * 2) + 2;
        var lat = 20; //(Math.random() * 3) + 50;
        var dataObject = ttl2jsonld('@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> . \
        @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> . \
        @prefix mu: <http://mu.semte.ch/vocabularies/core/> . \
        <https://data.vlaanderen.be/id/straatnaam/' + count++ + '> a <https://data.vlaanderen.be/ns/adres#Straatnaam>  ; <http://www.w3.org/2000/01/rdf-schema#label> "Teststraat"@nl ; <long> ' + long + ' ; <lat> ' + lat + ' .');
        tree.addData("Teststraat", dataObject);
        chai_1.expect(tree.getTreeObject().node_count).to.equal(1);
    });
    it('adding street names to tree', function () {
        for (var _i = 0, readLines_1 = readLines; _i < readLines_1.length; _i++) {
            var line = readLines_1[_i];
            // Create new Triple object to add to the given tree, containing a representation and an object.
            var long = (Math.random() * 2) + 2;
            var lat = (Math.random() * 3) + 50;
            var dataObject = ttl2jsonld('@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> . \
          @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> . \
          @prefix mu: <http://mu.semte.ch/vocabularies/core/> . \
          <https://data.vlaanderen.be/id/straatnaam/' + count++ + '> a <https://data.vlaanderen.be/ns/adres#Straatnaam>  ; <http://www.w3.org/2000/01/rdf-schema#label> "' + line + '"@nl ; <long> ' + long + ' ; <lat> ' + lat + ' .');
            // Add the member to the tree.
            var node = tree.addData(line, dataObject);
            if (node !== null && node !== undefined) {
                representations.push(line);
            }
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
            var rep = representations_1[_i];
            var foundreps = newtree.searchData(rep);
            chai_1.expect(newtree.searchNode(rep).length).equals(1);
            // console.log("foundreps", foundreps)
            if (foundreps === null) {
                chai_1.expect(false);
            }
            else {
                var found = false;
                for (var i = 0; i < foundreps.length; i++) {
                    if (foundreps[i].get_representation() === rep) {
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
    checkRelations(childRelationArray);
    for (var _b = 0, childRelationArray_1 = childRelationArray; _b < childRelationArray_1.length; _b++) {
        var relation = childRelationArray_1[_b];
        chai_1.expect(relation).not.null;
        chai_1.expect(relation.identifier).not.null;
        chai_1.expect(relation.type).not.null;
        chai_1.expect(relation.value).not.null;
    }
    chai_1.expect(totalItems).to.equal(currentNode.get_remainingItems());
}
function checkRelations(relationList) {
    var sortedRelations = relationList.sort(function (rel1, rel2) {
        if (rel1.value === rel2.value) {
            if (rel1.type === ChildRelation_1.ChildRelation.LesserOrEqualThanRelation && rel2.type === ChildRelation_1.ChildRelation.GreaterThanRelation) {
                return -1;
            }
            else if (rel1.type === ChildRelation_1.ChildRelation.GreaterThanRelation && rel2.type === ChildRelation_1.ChildRelation.LesserOrEqualThanRelation) {
                return 1;
            }
            else {
                console.log("RELATIONS INCORRECT", rel1, rel2);
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