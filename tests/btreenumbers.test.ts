import { expect } from 'chai';
import { Node } from "../src/Node/Node"
import { TreeRepresentation } from "../src/treerepresentation/TreeRepresentation";
import { BTreeManager } from '../src/treemanager/BTreeManager';

let sourceDirectory = "tests/testdata/"
let binaryTreeStringDataLocation = "binary_streets/"
let maxFragmentSize = 5
let maxCachedFragments = 10000

describe('Binary Tree numbers tests', () => {
  let readLines : Array<number> = []
  let representations : any[] = []
  var treeManager = new BTreeManager()
  
  for (let i = 0; i < 20000; i++){
    readLines.push(1+Math.ceil(Math.random() * 10000))
  }

  let tree = treeManager.createTree(sourceDirectory, 
    binaryTreeStringDataLocation, 
    "oslo:label",  // shacl:path
    maxCachedFragments, 
    maxFragmentSize)

  it('creating new Tree object', () => {
    expect(tree.getTreeObject().node_count).to.equal(0);
  });

  let identifier = 0
  it('adding street names to tree', () => {
    for (let line of readLines) {
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
    newtree = treeManager.readTree(sourceDirectory, 
      binaryTreeStringDataLocation, 
      "oslo:label",  // shacl:path
      maxCachedFragments, 
      maxFragmentSize);

      for (let entry of representations) {
        let identifier = entry[1]
        let rep = entry[0]
        let foundreps = newtree.searchData(rep);
        if (newtree.searchNode(rep).length === 0) {console.error(entry); newtree.searchData(rep.toString())}
        expect(newtree.searchNode(rep).length).gt(0)
        if (foundreps === null) { expect(false) } else {
          let found = false
          for (let i = 0; i < foundreps.length; i++){
            let entry : any = foundreps[i]
            if (entry["contents"]["@id"] === identifier["@id"]) {
              found = true;
            }
          }
          expect(found).equals(true)
        }
      }
  })

  it('checking total children count in each node to be the sum of the child items ', () => {
    if ( newtree === null ) { throw new Error("reading the tree items resulted in a null tree object.")}
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
  // checkRelations(childRelationArray)
  for (let relation of childRelationArray){
    expect(relation).not.null
    expect(relation.identifier).not.null
    expect(relation.type).not.null
    expect(relation.value).not.null
  }
  
  expect(totalItems).to.equal(currentNode.get_remainingItems());
}