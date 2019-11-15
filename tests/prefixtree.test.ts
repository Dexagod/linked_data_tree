import { expect } from 'chai';
// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
// import 'mocha';

import { Node } from "../src/Node/Node"
import { TreeRepresentation } from "../src/treerepresentation/TreeRepresentation";
import { PrefixTreeManager } from '../src/treemanager/PrefixTreeManager';
import { Identifier } from '../src/Identifier';
import { Normalizer } from '../src/CustomWordNormalizer';
const ttl2jsonld = require('@frogcat/ttl2jsonld').parse;
import fs = require("fs")

let sourceDirectory = "tests/testdata/"
let sourceFile = "tests/straatnamen20k.txt"
let maxFragmentSize = 500
let maxCachedFragments = 10000



let prefixTreeStringDataLocation = "prefix_streets/"
let prefixTreeStringLocation = "prefix_collections/"
let prefixTreeStringFile = "prefix_streetnames" 

let normalize = new Normalizer().normalize



// Read input file




describe('Prefix Tree tests', () => {


  let readLines = fs.readFileSync(sourceFile).toString().split("\n")

  var treeManager = new PrefixTreeManager()
  let tree = treeManager.createTree(sourceDirectory, 
    prefixTreeStringDataLocation, 
    prefixTreeStringLocation, 
    prefixTreeStringFile, 
    "oslo:StraatNaam",  // manages
    "oslo:StraatNaam",  // shacl:path
    "oslo:label",  // shacl:path
    maxCachedFragments, 
    maxFragmentSize)

  it('creating new Tree object', () => {
    expect(tree.getTreeObject().node_count).to.equal(0);
  });

  let count = 0
  it('Adding a single item to tree', () => {
    let long = 10//(Math.random() * 2) + 2;
    let lat = 20//(Math.random() * 3) + 50;
    let dataObject = ttl2jsonld('@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> . \
        @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> . \
        @prefix mu: <http://mu.semte.ch/vocabularies/core/> . \
        <https://data.vlaanderen.be/id/straatnaam/' + count++ + '> a <https://data.vlaanderen.be/ns/adres#Straatnaam>  ; <http://www.w3.org/2000/01/rdf-schema#label> "Teststraat"@nl ; <long> ' + long + ' ; <lat> ' + lat + ' .')
    tree.addData("Teststraat", dataObject)

    expect(tree.getTreeObject().node_count).to.equal(1);
    // expect(tree.getTreeObject().get_root_node_identifier().value).to.equal("");

  });

  let i = 0
  it('adding street names to tree', () => {
    for (let line of readLines) {
      // Create new Triple object to add to the given tree, containing a representation and an object.
      let long = (Math.random() * 2) + 2;
      let lat = (Math.random() * 3) + 50;
      let dataObject = ttl2jsonld('@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> . \
          @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> . \
          @prefix mu: <http://mu.semte.ch/vocabularies/core/> . \
          <https://data.vlaanderen.be/id/straatnaam/' + count++ + '> a <https://data.vlaanderen.be/ns/adres#Straatnaam>  ; <http://www.w3.org/2000/01/rdf-schema#label> "' + line + '"@nl ; <long> ' + long + ' ; <lat> ' + lat + ' .')

      // Add the member to the tree.
      // console.log("adding data", i++)
      let node = tree.addData(line, dataObject, line)
      if (node === undefined || node === null){
        console.error("NULL NODE", line)
      }
    }
  })

  it ('writing tree object', () => {
    tree.doneAdding()    
  })

  let newtree : TreeRepresentation | null = null;
  it('checking all items to be in the tree', () => {
  
    newtree = treeManager.readTree(sourceDirectory, 
      prefixTreeStringDataLocation, 
      prefixTreeStringLocation, 
      prefixTreeStringFile, 
      "oslo:StraatNaam",  // manages
      "oslo:StraatNaam",  // shacl:path
      "oslo:label",  // shacl:path
      maxCachedFragments, 
      maxFragmentSize)

    if ( newtree === null ) { throw new Error("reading the tree items resulted in a null tree object." )}
    for (let line of readLines) { 
      let normalizedline = normalize(line)
        if (normalizedline !== null){
        let spaceSeparatedRepresentations = normalizedline.split(" ")
        for (let i = 0; i < spaceSeparatedRepresentations.length; i++){
          let repSubString = spaceSeparatedRepresentations.slice(i).join(" ")
          let representations = newtree.searchData(repSubString)
          if (representations === null) { console.error("null prepresentations"); expect(false) } else {

            if (representations.map(e => e.get_representation()).indexOf(repSubString) === -1 ) {
              console.log(line, repSubString)
            }
            expect( representations.map(e => e.get_representation()).indexOf(repSubString) ).to.not.equal( -1 ) }
        }
      }
    }
  })  


  
  it('checking total children count in each node to be the sum of the child items ', () => {
    if ( newtree === null ) { throw new Error("reading the tree items resulted in a null tree object." )}
    let rootNode = newtree.getTreeObject().get_root_node()

    // TODO:: make this recursive (reads whole tree in memory wel ! best eerst de test op de namen dat de boom weer volledig in memory zit)
    checkItems(rootNode)
  
  })
  

});

  function checkItems(currentNode : Node){
    let totalItems = 0
      for ( let child of currentNode.get_children_objects() ){
        checkItems(child)
        totalItems += child.get_total_children_count() + 1;
      }
      let childRelationArray = currentNode.children;
      for (let relation of childRelationArray){
        expect(relation).not.null
        expect(relation.identifier).not.null
        expect(relation.type).not.null
        expect(relation.value).not.null
      }
      expect(totalItems).to.equal(currentNode.get_total_children_count());
  }

