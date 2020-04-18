import { expect } from 'chai';
import { TreeRepresentation } from "../src/treerepresentation/TreeRepresentation";
import { HydraPartialCollectionViewManager } from '../src/treemanager/HydraPartialCollectionViewManager';
import fs = require("fs")

let sourceFile = "tests/straatnamen20k.txt"
let config = {
  rootDir : 'tests/testdata/',
  dataDir : 'hydra_streets/',
  treePath: 'oslo:label',
  fragmentSize: 500
}
let location = config['rootDir'] + config['dataDir']




// Read input file




describe('Hydra tests', () => {


  let readLines = fs.readFileSync(sourceFile).toString().split("\n")
  let representations : any[] = []

  var treeManager = new HydraPartialCollectionViewManager()
  let tree = treeManager.createTree(config)

  it('creating new Tree object', () => {
    expect(tree.getTreeObject().node_count).to.equal(0);
  });

  let identifier = 0
  it('Adding a single item to tree', () => {
    let dataObject = {"@id": identifier++}
    tree.addData("Teststraat", dataObject)

    expect(tree.getTreeObject().node_count).to.equal(1);
  });


  let i = 0
  it('adding street names to tree', () => {
    for (let line of readLines) {
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
  
    newtree = treeManager.readTree(location)

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

});