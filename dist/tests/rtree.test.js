"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var RTreeManager_1 = require("../src/treemanager/RTreeManager");
var terraformer_parser = __importStar(require("terraformer-wkt-parser"));
var ttl2jsonld = require('@frogcat/ttl2jsonld').parse;
var N3 = require('n3');
var fs = require("fs");
var sourceDirectory = "tests/testdata/";
var sourceFile = "tests/straatnamen20k.txt";
var maxFragmentSize = 50;
var maxCachedFragments = 10000;
var RTreeStringDataLocation = "rtree_streets/";
var RTreeStringLocation = "rtree_collections/";
var RTreeStringFile = "rtree_streetnames";
describe('RTree tests', function () {
    var readLines = fs.readFileSync(sourceFile).toString().split("\n");
    var representations = [];
    var treeManager = new RTreeManager_1.RTreeManager();
    var tree = treeManager.createTree(sourceDirectory, RTreeStringDataLocation, "oslo:label", // shacl:path
    maxCachedFragments, maxFragmentSize);
    it('creating new Tree object', function () {
        chai_1.expect(tree.getTreeObject().node_count).to.equal(0);
    });
    var count = 0;
    it('Adding a single item to tree', function () {
        var long = (Math.random() * 2) + 2;
        var lat = (Math.random() * 3) + 50;
        var dataObject = ttl2jsonld('@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> . \
                                  @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> . \
                                  @prefix mu: <http://mu.semte.ch/vocabularies/core/> . \
                                  <https://data.vlaanderen.be/id/straatnaam/' + count++ + '> a <https://data.vlaanderen.be/ns/adres#Straatnaam>  ; <http://www.w3.org/2000/01/rdf-schema#label> "Teststraat"@nl ; <long> ' + long + ' ; <lat> ' + lat + ' .');
        var representation = "POINT (" + lat + " " + long + ")";
        tree.addData(representation, dataObject);
        chai_1.expect(tree.getTreeObject().node_count).to.equal(1);
        chai_1.expect(terraformer_parser.convert(tree.getTreeObject().get_root_node().get_identifier().value)).to.equal(representation);
    });
    it('adding street names to tree', function () {
        for (var _i = 0, readLines_1 = readLines; _i < readLines_1.length; _i++) {
            var line = readLines_1[_i];
            // Create new Triple object to add to the given tree, containing a representation and an object.
            var long = (Math.random() * 2) + 2;
            var lat = (Math.random() * 3) + 50;
            var representation = "POINT (" + lat + " " + long + ")";
            // Add the member to the tree.
            var dataObject = ttl2jsonld('@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> . \
                                          @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> . \
                                          @prefix mu: <http://mu.semte.ch/vocabularies/core/> . \
                                          <https://data.vlaanderen.be/id/straatnaam/' + count++ + '> a <https://data.vlaanderen.be/ns/adres#Straatnaam>  ; <http://www.w3.org/2000/01/rdf-schema#label> "' + line + '"@nl ; <long> ' + long + ' ; <lat> ' + lat + ' .');
            var node = tree.addData(representation, dataObject);
            if (node !== null && node !== undefined) {
                representations.push(representation);
            }
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
            var rep = representations_1[_i];
            var foundreps = newtree.searchData(rep);
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
                console.log("FOUND");
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
    for (var _b = 0, childRelationArray_1 = childRelationArray; _b < childRelationArray_1.length; _b++) {
        var relation = childRelationArray_1[_b];
        chai_1.expect(relation).not.null;
        chai_1.expect(relation.identifier).not.null;
        chai_1.expect(relation.type).not.null;
        chai_1.expect(relation.value).not.null;
    }
    chai_1.expect(totalItems).to.equal(currentNode.get_remainingItems());
}
// function checkItems(currentNode : Node){
//   let totalItems = 0
//     for ( let child of currentNode.get_children_objects() ){
//       checkItems(child)
//       totalItems += child.get_remainingItems() + 1;
//     }
//     let childRelationArray = currentNode.children;
//     for (let relation of childRelationArray){
//       expect(relation).not.null
//       expect(relation.identifier).not.null
//       expect(relation.type).not.null
//       expect(relation.value).not.null
//     }
//     expect(totalItems).to.equal(currentNode.get_remainingItems());
// }
//# sourceMappingURL=rtree.test.js.map