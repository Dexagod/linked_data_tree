// import { expect } from 'chai';
// // if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
// // import 'mocha';

// import { Node } from "../src/Node/Node"
// import { Member } from "../src/DataObjects/Member"
// import { TreeRepresentation } from "../src/treerepresentation/TreeRepresentation";
// import { BinaryBTreeManager } from '../src/treemanager/BinaryBTreeManager';
// import { Identifier } from '../src/Identifier';
// const ttl2jsonld = require('@frogcat/ttl2jsonld').parse;

// import fs = require("fs")
// import { Relation } from '../src/Relation';
// import { ChildRelation } from '../src/Relations/ChildRelation';
// let sourceDirectory = "tests/testdata/"
// let sourceFile = "tests/straatnamen20k.txt"
// let binaryTreeStringDataLocation = "binary_streets/"
// let binaryTreeStringLocation = "binary_collections/"
// let binaryTreeStringFile = "binary_streetnames" 
// let maxFragmentSize = 50 // 100
// let maxCachedFragments = 10000
// // Read input file




// describe('Binary Tree numbers tests', () => {
//   let readLines : Array<number> = []// fs.readFileSync(sourceFile).toString().split("\n")
//   for (let i = 0; i < 20000; i++){
//     readLines.push(Math.floor(Math.random() * 10000))
//   }
//   let representations : any[] = []

//   var treeManager = new BinaryBTreeManager()
  
  
//   let tree = treeManager.createTree(sourceDirectory, 
//     binaryTreeStringDataLocation, 
//     "oslo:label",  // shacl:path
//     maxCachedFragments, 
//     maxFragmentSize)

//   it('creating new Tree object', () => {
//     expect(tree.getTreeObject().node_count).to.equal(0);
//   });

//   let count = 0 
//   it('adding street names to tree', () => {
//     for (let line of readLines) {
//       // Create new Triple object to add to the given tree, containing a representation and an object.
//       let long = (Math.random() * 2) + 2;
//       let lat = (Math.random() * 3) + 50;

//       let dataObject = ttl2jsonld('@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> . \
//           @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> . \
//           @prefix mu: <http://mu.semte.ch/vocabularies/core/> . \
//           <https://data.vlaanderen.be/id/straatnaam/' + count++ + '> a <https://data.vlaanderen.be/ns/adres#Straatnaam>  ; <http://www.w3.org/2000/01/rdf-schema#label> "'+line+'"@nl ; <long> ' + long + ' ; <lat> ' + lat + ' .')

//       // Add the member to the tree.
//       let node = tree.addData(line, dataObject)
//       if (node !== null && node !== undefined){
//         representations.push(line)
//       }
//     }
//   })
  
//   it ('writing tree object', () => {
//     tree.doneAdding()
    
//   })

//   let newtree : TreeRepresentation | null = null;
//   it('checking all items to be in the tree', () => {
  
//     newtree = treeManager.readTree(sourceDirectory, 
//       binaryTreeStringDataLocation, 
//       "oslo:label",  // shacl:path
//       maxCachedFragments, 
//       maxFragmentSize);

//       for (let rep of representations) {
//         let foundreps = newtree.searchData(rep);
//         expect(newtree.searchNode(rep).length).gte(1)
//         // console.log("foundreps", foundreps)
//         if (foundreps === null) { expect(false) } else {
//           let found = false
//           for (let i = 0; i < foundreps.length; i++){
//             if (foundreps[i].get_representation() === rep) {
//               found = true;
//             }
//           }
//           expect(found).equals(true)
//         }
//       }
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
//   if (currentNode.has_child_relations() === false){
//     if (rootNodeDepth === null){
//       rootNodeDepth = depth;
//     } else {
//       expect (rootNodeDepth).equals(depth)
//     }
//   }
//   for ( let child of currentNode.get_children_objects() ){
//     totalItems += child.get_remainingItems();
//     checkItems(child, depth + 1)
//   }
//   totalItems += currentNode.get_members().length

//   let childRelationArray = currentNode.children;
//   // checkRelations(childRelationArray)
//   for (let relation of childRelationArray){
//     expect(relation).not.null
//     expect(relation.identifier).not.null
//     expect(relation.type).not.null
//     expect(relation.value).not.null
//   }
  
//   expect(totalItems).to.equal(currentNode.get_remainingItems());
// }

// // function checkRelations(relationList : Array<Relation>){
// //   let sortedRelations = relationList.sort(function(rel1, rel2){
// //     // if (parseInt(rel1.value) === parseInt(rel2.value)){
// //     if (parseInt(rel1.identifier.nodeId) === parseInt(rel2.identifier.nodeId)){
// //       if (rel1.type === ChildRelation.LesserOrEqualThanRelation && (rel2.type === ChildRelation.GreaterThanRelation || rel2.type === ChildRelation.GreaterOrEqualThanRelation) ){
// //         return -1;
// //       } else if ( (rel1.type === ChildRelation.GreaterThanRelation || rel1.type === ChildRelation.GreaterOrEqualThanRelation) && rel2.type === ChildRelation.LesserOrEqualThanRelation){
// //         return 1
// //       } else {
// //         expect(false)
// //         return 0
// //       }
// //     } else {
// //       if (rel1.value === rel2.value){
// //         return
// //       } else {
// //         return rel1.value - rel2.value
// //       }
// //       return parseInt(rel1.value) - parseInt(rel2.value)
// //     }
// //   })

// //   for (let i = 0; i < sortedRelations.length - 1; i++){
// //     let smallRelation = sortedRelations[i]
// //     let largeRelation = sortedRelations[i+1]
    
// //     if (parseInt(smallRelation.value) === parseInt(largeRelation.value)){
// //       expect(smallRelation.type).equals(ChildRelation.LesserOrEqualThanRelation)
// //       if ( ! (largeRelation.type === ChildRelation.GreaterOrEqualThanRelation || largeRelation.type === ChildRelation.GreaterThanRelation) ) {
// //         expect(false)
// //       }
// //       // expect(largeRelation.type).equals(ChildRelation.GreaterThanRelation || ChildRelation.Grea)
// //       expect(smallRelation.identifier.nodeId).not.equals(largeRelation.identifier.nodeId)
// //     } else {
// //       expect(parseInt(smallRelation.value)).lt(parseInt(largeRelation.value))
// //       if ( ! (smallRelation.type === ChildRelation.GreaterOrEqualThanRelation || smallRelation.type === ChildRelation.GreaterThanRelation) ) {
// //         expect(false)
// //       }
// //       expect(largeRelation.type).equals(ChildRelation.LesserOrEqualThanRelation)
// //       expect(smallRelation.identifier.nodeId).equals(largeRelation.identifier.nodeId)
// //     }
// //   }
// // }
  

