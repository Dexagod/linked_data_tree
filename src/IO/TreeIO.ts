import { Tree } from "../Tree/Tree"
import { Cache } from "../Cache/Cache";
import { Identifier } from '../Identifier';
import { NodeIO } from './NodeIO';
import fs = require('fs');


var context = {
  "tree": "https://w3id.org/tree#",
  "hydra": "http://www.w3.org/ns/hydra/core#",
  "totalitems": "tree:remainingItems"
}


export class TreeIO {
  treeFile: string;
  treeLocation: string;
  sourceDirectory: string;
  dataFolder: string;

  treeManages: any;
  

    constructor(sourceDirectory: string, dataFolder: string, treeLocation: string, treeFile: string, treeManages: any){
      this.treeFile = treeFile;
      this.treeLocation = treeLocation;
      this.sourceDirectory = sourceDirectory;
      this.dataFolder = dataFolder;
      if (!fs.existsSync(sourceDirectory)){
        fs.mkdirSync(sourceDirectory, {recursive : true});
      }
        
      if (!fs.existsSync(sourceDirectory + treeLocation)){        
        fs.mkdirSync(sourceDirectory + treeLocation, {recursive : true});
      }

      this.treeManages = treeManages;
    }
  
  write_tree(tree: Tree, writeToFile : boolean = true) {
    let id = this.getCollectionIdentifier()
    let treeRootNodeIdentifier = tree.get_root_node_identifier()
    if (treeRootNodeIdentifier === null) { throw new Error("Tree root node is null") }
    let writeTreeObj : any = {
      "@context": context,
      "@id": id,
      "@type": "hydra:Collection",
      "tree:remainingItems" : tree.get_root_node().get_total_children_count(),
      "hydra:manages" : this.treeManages,
      "hydra:view": { "@id": this.getNodeLocation(treeRootNodeIdentifier.nodeId), "@type": "tree:Node"}
    } 

    let JSONSTRING = JSON.stringify(writeTreeObj);
    
    if(writeToFile){
      fs.writeFileSync(this.readTreelocation(this.treeFile), JSONSTRING, {encoding: 'utf-8'})   
    } 

    return writeTreeObj
  }

  read_tree(prototypeObject : any, nodeIO: NodeIO) {
    let input_string = fs.readFileSync(this.readTreelocation(this.treeFile), {encoding: 'utf-8'})
    let tree = JSON.parse(input_string);
    tree["cache"] = new Cache(this.sourceDirectory, this.dataFolder, tree.max_fragment_size, nodeIO)
    tree["root_node_identifier"] = this.retrieveNodeIdentifier(tree["hydra:view"]["@id"], null)
    Object.setPrototypeOf(tree, prototypeObject.prototype)
    delete tree["hydra:manages"]
    delete tree["hydra:view"]
    delete tree["@context"]
    return tree
  }

  private readTreelocation(name: string){
    return this.sourceDirectory + this.treeLocation + name + ".jsonld"
  }

  private getNodeLocation(nodeId: number){
    return this.sourceDirectory + this.dataFolder + "node" + nodeId.toString() + ".jsonld"
  }

  private getCollectionIdentifier(){
    this.sourceDirectory + this.treeLocation + this.treeFile
  }
  
  private retrieveNodeIdentifier(str: string, value: any): Identifier{
    let nodeId = str.replace(this.sourceDirectory + this.dataFolder + "node", "").replace("/","").replace(".jsonld", "");
    if (nodeId === null) { throw new Error("requesting node with null id") }
    else { return new Identifier(parseInt(nodeId), value); }
  }

}


interface TreeObjectInterface{
  "@context" : any,
  "@id" : string;
  "@type" : string; 
  "tree:remainingItems" : number,
  "hydra:manages" : any,
  "hydra:view": object
}



