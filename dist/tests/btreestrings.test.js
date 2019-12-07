"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var BinaryBTreeManager_1 = require("../src/treemanager/BinaryBTreeManager");
var ttl2jsonld = require('@frogcat/ttl2jsonld').parse;
var fs = require("fs");
var sourceDirectory = "tests/testdata/";
var sourceFile = "tests/straatnamen20k.txt";
var binaryTreeStringDataLocation = "binary_streets/";
var binaryTreeStringLocation = "binary_collections/";
var binaryTreeStringFile = "binary_streetnames";
var maxFragmentSize = 6; // 100
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
        checkItems(rootNode);
    });
});
function checkItems(currentNode) {
    var totalItems = 0;
    for (var _i = 0, _a = currentNode.get_children_objects(); _i < _a.length; _i++) {
        var child = _a[_i];
        totalItems += child.get_total_member_count();
        checkItems(child);
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
    chai_1.expect(totalItems).to.equal(currentNode.get_total_member_count());
}
//   function checkItems(currentNode : Node){
//     let totalItems = 0
//       for ( let child of currentNode.get_children_objects() ){
//         checkItems(child)
//         totalItems += child.get_total_member_count() + 1;
//       }
//       let childRelationArray = currentNode.children;
//       for (let relation of childRelationArray){
//         expect(relation).not.null
//         expect(relation.identifier).not.null
//         expect(relation.type).not.null
//       }
//       expect(totalItems).to.equal(currentNode.get_total_member_count());
//   }
// })
//   it('checking total children count in each node to be the sum of the child items ', () => {
//     if ( newtree === null ) { throw new Error("reading the tree items resulted in a null tree object." )}
//     let rootNode = newtree.getTreeObject().get_root_node()
//     // TODO:: make this recursive (reads whole tree in memory wel ! best eerst de test op de namen dat de boom weer volledig in memory zit)
//     checkItems(rootNode)
//   })
//   it('checking all items have been added to the tree', () => {
//     if(newtree === null){
//       expect(false)
//       return;
//     }
//     for (let line of readLines) { 
//       let representations = newtree.searchData(line)
//       if (representations === null) { console.error("null prepresentations"); expect(false) } else {
//         expect( representations.map(e => e.get_representation()).indexOf(line) ).to.not.equal( -1 ) }
//     }
//   })
// });
// function checkItems(currentNode : Node){
//   let totalItems = 0
//     for ( let child of currentNode.get_children_objects() ){
//       checkItems(child)
//       totalItems += child.get_total_member_count() + 1;
//     }
//     let childRelationArray = currentNode.children;
//     for (let relation of childRelationArray){
//       expect(relation).not.null
//       expect(relation.identifier).not.null
//       expect(relation.type).not.null
//       expect(relation.value).not.null
//     }
//     expect(totalItems).to.equal(currentNode.get_total_member_count());
// }
//# sourceMappingURL=btreestrings.test.js.map