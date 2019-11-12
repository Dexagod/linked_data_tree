// import { expect } from 'chai';
// // if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
// // import 'mocha';

// import { Node } from "../src/Node/Node"
// import { TreeRepresentation } from "../src/treerepresentation/TreeRepresentation";
// import { PrefixTreeManager } from '../src/treemanager/PrefixTreeManager';
// import { Identifier } from '../src/Identifier';
// import { Normalizer } from '../src/CustomWordNormalizer';
// const ttl2jsonld = require('@frogcat/ttl2jsonld').parse;
// import fs = require("fs")

// let sourceDirectory = "tests/testdata/"
// let sourceFile = "tests/straatnamen20k.txt"
// let maxFragmentSize = 125
// let maxCachedFragments = 10000



// let prefixTreeStringDataLocation = "prefix_streets/"
// let prefixTreeStringLocation = "prefix_collections/"
// let prefixTreeStringFile = "prefix_streetnames" 

// let normalize = new Normalizer().normalize



// // Read input file




// describe('Prefix Tree tests', () => {


//   let readLines = fs.readFileSync(sourceFile).toString().split("\n")

//   var treeManager = new PrefixTreeManager()
//   let tree = treeManager.createTree(sourceDirectory, 
//     prefixTreeStringDataLocation, 
//     prefixTreeStringLocation, 
//     prefixTreeStringFile, 
//     "oslo:StraatNaam",  // manages
//     "oslo:StraatNaam",  // shacl:path
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

//     expect(tree.getTreeObject().node_count).to.equal(2);
//     expect(tree.getTreeObject().get_root_node().value).to.equal("");
//     expect(tree.getTreeObject().get_root_node().get_children_objects().length).to.equal(1);
//     expect(tree.getTreeObject().get_root_node().get_children_objects()[0].get_value()).to.equal(normalize("Teststraat"));

//   });

//   it('adding street names to tree', () => {
//     for (let line of readLines) {
//       // Create new Triple object to add to the given tree, containing a representation and an object.
//       let long = (Math.random() * 2) + 2;
//       let lat = (Math.random() * 3) + 50;
//       let dataObject = ttl2jsonld('@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> . \
//           @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> . \
//           @prefix mu: <http://mu.semte.ch/vocabularies/core/> . \
//           <https://data.vlaanderen.be/id/straatnaam/' + count++ + '> a <https://data.vlaanderen.be/ns/adres#Straatnaam>  ; <http://www.w3.org/2000/01/rdf-schema#label> "Teststraat"@nl ; <long> ' + long + ' ; <lat> ' + lat + ' .')

//       // Add the member to the tree.
//       tree.addData(line, dataObject, line)
//     }
//   })

//   it ('writing tree object', () => {
//     tree.doneAdding()    
//   })

//   let newtree : TreeRepresentation | null = null;
//   it('checking all items to be in the tree', () => {
  
//     newtree = treeManager.readTree(sourceDirectory, 
//       prefixTreeStringDataLocation, 
//       prefixTreeStringLocation, 
//       prefixTreeStringFile, 
//       "oslo:StraatNaam",  // manages
//       "oslo:StraatNaam",  // shacl:path
//       "oslo:label",  // shacl:path
//       maxCachedFragments, 
//       maxFragmentSize)

//     if ( newtree === null ) { throw new Error("reading the tree items resulted in a null tree object." )}
//     for (let line of readLines) { 
//       let normalizedline = normalize(line)
//         if (normalizedline !== null){
//         let spaceSeparatedRepresentations = normalizedline.split(" ")
//         for (let i = 0; i < spaceSeparatedRepresentations.length; i++){
//           let representations = newtree.searchData(spaceSeparatedRepresentations.slice(i).join(" "))
//           if (representations === null) { expect(false) } else {
//             let found = false
//             for (let rep of representations){
//               if (rep.get_representation() === line){
//                 expect(rep.get_representation()).to.equal(line);
//                 found = true;
//               }
//             }
//             expect( found ).to.equal( true )
//           }
//         }
//       }
//     }
//   })  


  
//   it('checking total children count in each node to be the sum of the child items ', () => {
//     if ( newtree === null ) { throw new Error("reading the tree items resulted in a null tree object." )}
//     let rootNode = newtree.getTreeObject().get_root_node()

//     // TODO:: make this recursive (reads whole tree in memory wel ! best eerst de test op de namen dat de boom weer volledig in memory zit)
//     checkItems(rootNode)
  
//   })
  

// });

//   function checkItems(currentNode : Node){
//     let totalItems = 0
//       for ( let child of currentNode.get_children_objects() ){
//         checkItems(child)
//         totalItems += child.get_total_children_count() + 1;
//       }

//       expect(currentNode.value).to.equal(currentNode.get_identifier().value);
      
//       let childrenIdentifierArrays = currentNode.children.values();
//       let next = childrenIdentifierArrays.next();
//       while (! next.done){

//         if (next.value === null || next === undefined){
//           expect(false)
//         } else {
//           next.value.forEach((childIdentifier : Identifier) => {
//             expect(childIdentifier.value).not.null
//           });
//         }
//         next = childrenIdentifierArrays.next();
//       }
//       expect(totalItems).to.equal(currentNode.get_total_children_count());
//   }



//   function printTree(rootNode : Node){
//     console.log("################Tree Start################")
//     printNode(rootNode)
//     console.log("################Tree End################")
//   }
//   function printNode(node : Node){
//     if (node.has_parent_node()){
//       console.log(node.get_value(), node.get_node_id(), node.get_parent_node().get_value(), printNodeChildren(node))
//     } else {
//       console.log(node.get_value(), node.get_node_id(), null, printNodeChildren(node))
//     }

//     for (let child of node.get_children_objects()){
//       printNode(child)
//     }

//   }

//   function printNodeChildren(node : Node){
//     let nodeVals = node.children.values()
//     let next = nodeVals.next()
//     let childrenString = "";
//     while(! next.done){
//       next.value.forEach(element => {
//           childrenString += element.nodeId + "-" + element.value + "   "
//       });
//       next = nodeVals.next()
//     }

//     return childrenString
//   }
