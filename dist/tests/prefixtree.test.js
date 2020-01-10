"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var PrefixTreeManager_1 = require("../src/treemanager/PrefixTreeManager");
var ttl2jsonld = require('@frogcat/ttl2jsonld').parse;
var fs = require("fs");
// const normalizeString = require('stringnormalizer');
var sourceDirectory = "tests/testdata/";
var sourceFile = "tests/straatnamen20k.txt";
var maxFragmentSize = 30;
var maxCachedFragments = 10000;
var prefixTreeStringDataLocation = "prefix_streets/";
var prefixTreeStringLocation = "prefix_collections/";
var prefixTreeStringFile = "prefix_streetnames";
// Read input file
describe('Prefix Tree tests', function () {
    var readLines = fs.readFileSync(sourceFile).toString().split("\n");
    var treeManager = new PrefixTreeManager_1.PrefixTreeManager();
    var tree = treeManager.createTree(sourceDirectory, prefixTreeStringDataLocation, "oslo:label", // shacl:path
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
        // expect(tree.getTreeObject().get_root_node_identifier().value).to.equal("");
    });
    var i = 0;
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
            // console.log("adding data", i++)
            var node = tree.addData(line, dataObject, line);
            if (node === undefined || node === null) {
                console.error("NULL NODE", line);
            }
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
        for (var _i = 0, readLines_2 = readLines; _i < readLines_2.length; _i++) {
            var line = readLines_2[_i];
            var representations = newtree.searchData(line);
            chai_1.expect(newtree.searchNode(line).length).gte(1);
            if (representations === null) {
                console.error("null prepresentations");
                chai_1.expect(false);
            }
            else {
                chai_1.expect(representations.map(function (e) { return e.get_representation(); }).indexOf(line)).to.not.equal(-1);
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
//# sourceMappingURL=prefixtree.test.js.map