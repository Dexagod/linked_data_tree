import { expect } from 'chai';
import { Node } from "../src/Node/Node"
import { TreeRepresentation } from "../src/treerepresentation/TreeRepresentation";
import { Identifier } from '../src/Identifier';
import { RTreeManager } from '../src/treemanager/RTreeManager';
import * as terraformer_parser from 'terraformer-wkt-parser';
const ttl2jsonld = require('@frogcat/ttl2jsonld').parse;
const N3 = require('n3');


import fs = require("fs")

let sourceDirectory = "tests/testdata/"
let sourceFile = "tests/straatnamen20k.txt"
let maxFragmentSize = 50
let maxCachedFragments = 10000

let RTreeStringDataLocation = "rtree_streets/"
let RTreeStringLocation = "rtree_collections/"
let RTreeStringFile = "rtree_streetnames" 


var PRNG = require('prng')

var prng = new PRNG(41); // use default seed







describe('RTree tests', () => {


  let readLines = fs.readFileSync(sourceFile).toString().split("\n")
  let representations : any[] = []

  var treeManager = new RTreeManager()
  
  let tree = treeManager.createTree(sourceDirectory, 
                                    RTreeStringDataLocation, 
                                    "oslo:label",  // shacl:path
                                    maxCachedFragments, 
                                    maxFragmentSize)

  it('creating new Tree object', () => {
    expect(tree.getTreeObject().node_count).to.equal(0);
  });

  // let count = 0
  // it('Adding a single item to tree', () => {
  //   // let long = (Math.random() * 2) + 2;
  //   // let lat = (Math.random() * 3) + 50;
  //   // let dataObject = ttl2jsonld('@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> . \
  //   //                               @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> . \
  //   //                               @prefix mu: <http://mu.semte.ch/vocabularies/core/> . \
  //   //                               <https://data.vlaanderen.be/id/straatnaam/' + count++ + '> a <https://data.vlaanderen.be/ns/adres#Straatnaam>  ; <http://www.w3.org/2000/01/rdf-schema#label> "Teststraat"@nl ; <long> ' + long + ' ; <lat> ' + lat + ' .')
  //   // let representation = "POINT (" + lat + " " + long + ")"
  //   // tree.addData(representation, dataObject)
  //   // expect(tree.getTreeObject().node_count).to.equal(1);
  //   // expect(terraformer_parser.convert(tree.getTreeObject().get_root_node().get_identifier().value)).to.equal(representation);

  // });

  let identifier = 0
  it('adding street names to tree', () => {
    
    
    // for (let line of readLines) {
    for (let index = 0; index < 2000; index++) {
      // Create new Triple object to add to the given tree, containing a representation and an object.
      // let long = prng.rand(2000000, 4000000);
      // let lat = prng.rand(50000000, 53000000);
      // long = long / 1000000
      // lat = lat / 1000000

      let long = prng.rand(0, 50);
      let lat = prng.rand(0, 50);
      // long = long / 1000000
      // lat = lat / 1000000


      let representation = "POINT (" + lat + " " + long  + ")"
      // Add the member to the tree.
      

      let dataObject = {"@id": identifier++}
      let node = tree.addData(representation, dataObject)

      let foundreps = tree.searchData(representation);
      if (foundreps === null) { expect(false) } else {
        let found = false
        // 
        for (let i = 0; i < foundreps.length; i++){
          let item : any = foundreps[i]
          if (item.contents["@id"] === dataObject["@id"]) {
            found = true;
          }
        }
        if (found === false){
          // console.log(representation, dataObject)
          
        }
        expect(found).equals(true)
      }


      // 'POINT (52.075111 3.079075)', { '@id': 12002 } ] []

      if (node !== null && node !== undefined){
        representations.push([representation, dataObject])
      }
    }
  })  

  it ('writing tree object', () => {
    tree.doneAdding()    
  })


  let newtree : TreeRepresentation | null = null;
  it('checking all items to be in the tree', () => {
  
    newtree = treeManager.readTree(sourceDirectory, 
      RTreeStringDataLocation, 
      "oslo:label",  // shacl:path
      maxCachedFragments, 
      maxFragmentSize)

    if ( newtree === null ) { throw new Error("reading the tree items resulted in a null tree object." )}
    for (let entry of representations) {
      let rep = entry[0]
      let dataObject = entry[1]
      let foundreps = newtree.searchData(rep);
      if (foundreps === null) { expect(false) } else {
        let found = false
        // 
        for (let i = 0; i < foundreps.length; i++){
          let item : any = foundreps[i]
          if (item["@id"] === dataObject["@id"]) {
            found = true;
          }
        }
        if (found === false){
          
          
        }
        expect(found).equals(true)
      }
    }
  })


  
  it('checking total children count in each node to be the sum of the child items ', () => {
    if ( newtree === null ) { throw new Error("reading the tree items resulted in a null tree object." )}
    let rootNode = newtree.getTreeObject().get_root_node()

    // TODO:: make this recursive (reads whole tree in memory wel ! best eerst de test op de namen dat de boom weer volledig in memory zit)
    checkItems(rootNode, 0)
  
  })
  

});


var rootNodeDepth : number | null = null

function checkItems(currentNode : Node, depth: number){
  let totalItems = 0
  if (currentNode.has_child_relations() === false){
    if (rootNodeDepth === null){
      rootNodeDepth = depth;
    } else {
      expect (rootNodeDepth).equals(depth)
    }
  }
  for ( let child of currentNode.get_children_objects() ){
    totalItems += child.get_remainingItems();
    checkItems(child, depth + 1)
  }
  totalItems += currentNode.get_members().length

    let childRelationArray = currentNode.children;
    for (let relation of childRelationArray){
      expect(relation).not.null
      expect(relation.identifier).not.null
      expect(relation.type).not.null
      expect(relation.value).not.null
    }
    expect(totalItems).to.equal(currentNode.get_remainingItems());
}
