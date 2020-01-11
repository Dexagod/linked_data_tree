// import { expect } from 'chai';
// // if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
// // import 'mocha';

// import { Node } from "../src/Node/Node"
// import { TreeRepresentation } from "../src/treerepresentation/TreeRepresentation";
// import { PrefixTreeManager } from '../src/treemanager/PrefixTreeManager';
// import { Identifier } from '../src/Identifier';
// const ttl2jsonld = require('@frogcat/ttl2jsonld').parse;
// import fs = require("fs")

// // const normalizeString = require('stringnormalizer');

// let sourceDirectory = "tests/testdata/"
// let sourceFile = "tests/straatnamen20k.txt"
// let maxFragmentSize = 50
// let maxCachedFragments = 10000



// let prefixTreeStringDataLocation = "prefix_streets/"
// let prefixTreeStringLocation = "prefix_collections/"
// let prefixTreeStringFile = "prefix_streetnames" 




// // Read input file




// describe('Prefix Tree tests', () => {


//   let readLines = fs.readFileSync(sourceFile).toString().split("\n")

//   var treeManager = new PrefixTreeManager()
//   let tree = treeManager.createTree(sourceDirectory, 
//     prefixTreeStringDataLocation, 
//     "oslo:label",  // shacl:path
//     maxCachedFragments, 
//     maxFragmentSize)

//   it('creating new Tree object', () => {
//     expect(tree.getTreeObject().node_count).to.equal(0);
//   });

//   let count = 0
//   it('Adding a single item to tree', () => {
//     let long = 10//(Math.random() * 2) + 2;
//     let lat = 20//(Math.random() * 3) + 50;
//     let dataObject = ttl2jsonld('@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> . \
//         @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> . \
//         @prefix mu: <http://mu.semte.ch/vocabularies/core/> . \
//         <https://data.vlaanderen.be/id/straatnaam/' + count++ + '> a <https://data.vlaanderen.be/ns/adres#Straatnaam>  ; <http://www.w3.org/2000/01/rdf-schema#label> "Teststraat"@nl ; <long> ' + long + ' ; <lat> ' + lat + ' .')
//     tree.addData("Teststraat", dataObject)

//     expect(tree.getTreeObject().node_count).to.equal(1);
//     // expect(tree.getTreeObject().get_root_node_identifier().value).to.equal("");

//   });

//   let identifier = 0
//   let representations = new Array();
//   it('adding street names to tree', () => {
//     for (let line of readLines) {
//       // Create new Triple object to add to the given tree, containing a representation and an object.
//       let long = (Math.random() * 2) + 2;
//       let lat = (Math.random() * 3) + 50;

//       let dataObject = {"@id": identifier++}

//       // Add the member to the tree.
//       // console.log("adding data", i++)
//       let node = tree.addData(line, dataObject, line)
//       if (node === undefined || node === null){
//         console.error("NULL NODE", line)
//         representations.push([line, dataObject])
//       }
//     }
//   })

//   it ('writing tree object', () => {
//     tree.doneAdding()    
//   })

//   let newtree : TreeRepresentation | null = null;
//   it('checking all items to be in the tree', () => {
  
//     newtree = treeManager.readTree(sourceDirectory, 
//       prefixTreeStringDataLocation, 
//       "oslo:label",  // shacl:path
//       maxCachedFragments, 
//       maxFragmentSize)

//     if ( newtree === null ) { throw new Error("reading the tree items resulted in a null tree object." )}
//     for (let entry of representations) {
//       let identifier = entry[1]
//       let line = entry[0]
//       let representations = newtree.searchData(line)
//       expect(newtree.searchNode(line).length).gte(1)
//       if (representations === null) { console.error("null prepresentations"); expect(false) } 
//       else {
//         // expect( representations.map(e => e.get_representation()).indexOf(line) ).to.not.equal( -1 ) }
//         if (representations === null) { expect(false) } else {
//           let found = false
//           for (let i = 0; i < representations.length; i++){
//             let entry : any = representations[i]
//             if (entry["@id"] === identifier["@id"]) {
//               found = true;
//             }
//           }
//           expect(found).equals(true)
//         }
//       }
//     }
//   })
  



  
//   it('checking total children count in each node to be the sum of the child items ', () => {
//     if ( newtree === null ) { throw new Error("reading the tree items resulted in a null tree object." )}
//     let rootNode = newtree.getTreeObject().get_root_node()

//     // TODO:: make this recursive (reads whole tree in memory wel ! best eerst de test op de namen dat de boom weer volledig in memory zit)
//     checkItems(rootNode, 0)
  
//   })
  

// });

// var rootNodeDepth : number | null = null

// function checkItems(currentNode : Node, depth: number){
//   let totalItems = 0
//     for ( let child of currentNode.get_children_objects() ){
//       totalItems += child.get_remainingItems();
//       checkItems(child, depth + 1)
//     }
//     totalItems += currentNode.get_members().length

//     let childRelationArray = currentNode.children;
//     for (let relation of childRelationArray){
//       expect(relation).not.null
//       expect(relation.identifier).not.null
//       expect(relation.type).not.null
//       expect(relation.value).not.null
//     }
//     expect(totalItems).to.equal(currentNode.get_remainingItems());
// }

