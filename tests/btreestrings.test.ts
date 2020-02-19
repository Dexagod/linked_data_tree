import { expect } from 'chai';
import { Node } from "../src/Node/Node"
import { TreeRepresentation } from "../src/treerepresentation/TreeRepresentation";
import { BTreeManager } from '../src/treemanager/BTreeManager';
import fs = require("fs")
import { Relation } from '../src/Relation';
import { ChildRelation } from '../src/Relations/ChildRelation';
let sourceDirectory = "tests/testdata/"
let sourceFile = "tests/straatnamen20k.txt"
let binaryTreeStringDataLocation = "binary_streets_strings/"
let maxFragmentSize = 100
let maxCachedFragments = 10000



let k = 0;


describe('Binary Tree String tests', () => {
  let readLines = fs.readFileSync(sourceFile).toString().split("\n")
  let representations : any[] = []

  var treeManager = new BTreeManager()
  
  
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
      line = line.trim()
      // Create new Triple object to add to the given tree, containing a representation and an object.
      let dataObject = {"@id": identifier++}

      // Add the member to the tree.
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
  // checkRelations(childRelationArray)
  for (let relation of childRelationArray){
    expect(relation).not.null
    expect(relation.identifier).not.null
    expect(relation.type).not.null
    expect(relation.value).not.null
  }
  
  // if (totalItems !== currentNode.get_remainingItems()){
  //   console.log(currentNode.get_children_objects().map( (e:Node) => { return [e.identifier.nodeId, e.remainingItems] }))
  // }
  // console.log(currentNode.get_remainingItems())
  expect(totalItems).to.equal(currentNode.get_remainingItems());
}

function checkRelations(relationList : Array<Relation>){
  let sortedRelations = relationList.sort(function(rel1, rel2){
    if (rel1.value === rel2.value){
      if ( (rel1.type === ChildRelation.LesserOrEqualThanRelation || rel1.type === ChildRelation.LesserThanRelation) &&
       (rel2.type === ChildRelation.GreaterThanRelation || rel2.type === ChildRelation.GreaterOrEqualThanRelation) ){
        return -1;
      } else if ( (rel1.type === ChildRelation.GreaterThanRelation || rel1.type === ChildRelation.GreaterOrEqualThanRelation) &&
                 (rel2.type === ChildRelation.LesserOrEqualThanRelation || rel2.type === ChildRelation.LesserThanRelation)){
        return 1 
      } else {
        expect(false)
        return 0
      }
    } else {
      if (typeof rel1.value === "string"){
        return rel1.value.localeCompare(rel2.value)
      } else {
        return rel1.value - rel2.value
      }
    }
  })

  for (let i = 0; i < sortedRelations.length - 1; i++){

    let smallRelation = sortedRelations[i]
    let largeRelation = sortedRelations[i+1]

    
    if (smallRelation.value === largeRelation.value){
      expect(smallRelation.type).equals(ChildRelation.LesserOrEqualThanRelation)
      expect(largeRelation.type).equals(ChildRelation.GreaterThanRelation)
    } else {
      if (typeof smallRelation.value === 'string'){
        expect(smallRelation.value.localeCompare(largeRelation.value)).lt(0)
        expect(smallRelation.type).equals(ChildRelation.GreaterThanRelation)
        expect(largeRelation.type).equals(ChildRelation.LesserOrEqualThanRelation)
      } else{
        expect(smallRelation.value).lt(largeRelation.value)
        expect(smallRelation.type).equals(ChildRelation.GreaterThanRelation)
        expect(largeRelation.type).equals(ChildRelation.LesserOrEqualThanRelation)
      }
    }
  }
}
  

