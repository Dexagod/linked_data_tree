import { expect } from 'chai';
import { Node } from "../src/Node/Node"
import { TreeRepresentation } from "../src/treerepresentation/TreeRepresentation";
import { PrefixTreeManager } from '../src/treemanager/PrefixTreeManager';
import fs = require("fs")

let sourceFile = "tests/straatnamen20k.txt"
let config = {
  rootDir : 'tests/testdata/',
  dataDir : 'prefix_streets/',
  treePath: 'oslo:label',
  fragmentSize: 100
}
let location = config['rootDir'] + config['dataDir']

let lines = fs.readFileSync(sourceFile).toString().split("\n")



describe('Prefix Tree tests', () => {

  var treeManager = new PrefixTreeManager()
  let tree = treeManager.createTree(config)

  it('creating new Tree object', () => {
    expect(tree.getTreeObject().node_count).to.equal(0);
  });

  
  let identifier = 0
  let representations = new Array();
  it('adding street names to tree', () => {
    for (let line of lines.slice(0, 10000)) {
      // Create new Triple object to add to the given tree, containing a representation and an object.
      let dataObject = {"@id": identifier++}
      tree.addData(line, dataObject)
      representations.push([line, dataObject])
    }
  })

  it ('writing tree object', () => {
    tree.doneAdding()    
  })

  let newtree : TreeRepresentation | null = null;
  it('checking all items to be in the tree', () => {
  
    tree = treeManager.readTree(location)
    for (let line of lines.slice(10000)) {
      // Create new Triple object to add to the given tree, containing a representation and an object.
      let dataObject = {"@id": identifier++}
      tree.addData(line, dataObject)
      representations.push([line, dataObject])
    }
    tree.doneAdding();
    
    newtree = treeManager.readTree(location)

    if ( newtree === null ) { throw new Error("reading the tree items resulted in a null tree object." )}
    for (let entry of representations) {
      let identifier = entry[1]
      let line = entry[0]
      let representations = newtree.searchData(line)
      expect(newtree.searchNode(line).length).gte(1)
      if (representations === null) { console.error("null prepresentations"); expect(false) } 
      else {
        // expect( representations.map(e => e.get_representation()).indexOf(line) ).to.not.equal( -1 ) }
        if (representations === null) { expect(false) } else {
          let found = false
          for (let i = 0; i < representations.length; i++){
            let entry : any = representations[i]
            if (entry["contents"]["@id"] === identifier["@id"]) {
              found = true;
            }
          }
          expect(found).equals(true)
        }
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
    if (totalItems != currentNode.get_remainingItems()){
      delete currentNode["fc"]
      console.log("ERROR", JSON.stringify(currentNode,null,2))
    }
    expect(totalItems).to.equal(currentNode.get_remainingItems());
}

