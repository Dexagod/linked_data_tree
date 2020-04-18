import { expect } from 'chai';
import { Node } from "../src/Node/Node"
import { TreeRepresentation } from "../src/treerepresentation/TreeRepresentation";
import { RTreeManager } from '../src/treemanager/RTreeManager';
import fs = require("fs")

let sourceFile = "tests/straatnamen20k.txt"
let config = {
  rootDir : 'tests/testdata/',
  dataDir : 'rtree_streets/',
  treePath: 'oslo:label',
  fragmentSize: 100
}
let location = config['rootDir'] + config['dataDir']


describe('RTree tests', () => {

  let representations : any[] = []
  var treeManager = new RTreeManager()
  let tree = treeManager.createTree(config)

  it('creating new Tree object', () => {
    expect(tree.getTreeObject().node_count).to.equal(0);
  });

  let identifier = 0
  it('adding street names to tree', () => {
    
    
    // for (let line of readLines) {
    for (let index = 0; index < 2000; index++) {
      // Create new Triple object to add to the given tree, containing a representation and an object.
      let long = Math.random() * 50
      let lat = Math.random() * 50


      let representation = "POINT (" + lat + " " + long  + ")"
      // Add the member to the tree.
      

      let dataObject = {"@id": identifier++}
      tree.addData(representation, dataObject)
      representations.push([representation, dataObject])
    }
  })  

  it ('writing tree object', () => {
    tree.doneAdding()    
  })


  let newtree : TreeRepresentation | null = null;
  it('checking all items to be in the tree', () => {
  
    newtree = treeManager.readTree(location)

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
          if (item["contents"]["@id"] === dataObject["@id"]) {
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
