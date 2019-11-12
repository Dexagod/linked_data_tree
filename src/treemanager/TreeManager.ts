import {
  TreeRepresentation
} from "../treerepresentation/TreeRepresentation";
import { 
  TreeIO
} from "../IO/TreeIO"
import {
  Tree
} from '../Tree/Tree';
import { 
  NodeIO
} from '../IO/NodeIO';

export abstract class TreeManager {

  treeIO : TreeIO | null;
  nodeIO : NodeIO | null;

  constructor(){
    this.nodeIO = null;
    this.treeIO = null;
  }

  /** 
   * Gets the tree object from the given location.
   * @param {string} sourceDirectory - base folder of the tree data
   * @param {*} treeLocation - folder containing the tree file in the sourceDirectory
   * @param {*} treeFile - tree file filename
   * @param {*} dataFolder - folder containing the fragment files in the sourceDirectory
   * @param {*} maxCachedFragments - maximal cachable fragments at once
   */
  readTree(sourceDirectory: string,
                dataFolder: string,
                treeLocation: string,
                treeFile: string,
                treeManages: any,
                nodeManages: any,
                nodeShaclPath: any,
                maxCachedFragments: number,
                maxFragmentSize: number): TreeRepresentation {
    let treeIO = this.getTreeIO(sourceDirectory, dataFolder, treeLocation, treeFile, treeManages);
    let nodeIO = this.getNodeIO(sourceDirectory, dataFolder, treeLocation, treeFile, nodeManages, nodeShaclPath)
    let tree = nodeIO.readTree(this.getTreeObjectPrototype());
    return this.createTreeRepresentation(tree,
                                          sourceDirectory, 
                                          dataFolder, 
                                          treeLocation, 
                                          treeFile,
                                          maxCachedFragments, 
                                          maxFragmentSize, 
                                          nodeIO,
                                          treeIO);
  }
  /**
   * Writes given tree object to a given location.
   * @param {Tree} tree - the Tree object that needs to be written.
   * @param {string} treeLocation - the folder in which the tree file needs to be written (in the sourceDirectory of the given tree), dependency of its fragment cache. 
   * @param {string} treeFile - the filename to which the tree needs to be written
   */
  // writeTree(treerep: TreeRepresentation, treeLocation: string, treeFile: string) {
  //   let tree = treerep.getTreeObject();
  //   let treeIO = new TreeIO(tree.get_cache().sourceDirectory, tree.get_cache().dataFolder, treeLocation, treeFile);
  //   treeIO.write_tree(tree);
  // }

  /**
   * Creates a new tree object.
   * @param {string} sourceDirectory - base forlder of the tree data
   * @param {string} dataFolder - folder containing the fragment files in the sourceDirectory
   * @param {number} maxCachedFragments - the maximal amount of elements in the cache
   */

  createTree(sourceDirectory: string,
                dataFolder: string,
                treeLocation: string,
                treeFile: string,
                treeManages: any,
                nodeManages: any,
                nodeShaclPath: any,
                maxCachedFragments: number,
                maxFragmentSize: number): TreeRepresentation {
    return this.createTreeRepresentation(null,
                                          sourceDirectory, 
                                          dataFolder, 
                                          treeLocation, 
                                          treeFile,
                                          maxCachedFragments, 
                                          maxFragmentSize, 
                                          this.getNodeIO(sourceDirectory, dataFolder, treeLocation, treeFile, nodeManages, nodeShaclPath),
                                          this.getTreeIO(sourceDirectory, dataFolder, treeLocation, treeFile, treeManages));
  }


  abstract createTreeRepresentation(tree : Tree | null,
                                      sourceDirectory: string,
                                      dataFolder: string,
                                      treeLocation: string,
                                      treeFile: string,
                                      maxCachedFragments: number,
                                      maxFragmentSize: number,
                                      nodeIO : NodeIO,
                                      treeIO : TreeIO): TreeRepresentation

  abstract getTreeObjectPrototype(): any;

  private getTreeIO(sourceDirectory : string, dataFolder : string, treeLocation : string, treeFile : string,  treeManages : any) : TreeIO{
    return this.getTreeIOObject(sourceDirectory, dataFolder, treeLocation, treeFile, treeManages);
  }

  private getNodeIO(sourceDirectory: string, dataFolder: string, treeLocation : string, treeFile : string, nodeManages : any, nodePath : any): NodeIO {
    return this.getNodeIOObject(sourceDirectory, dataFolder, treeLocation, treeFile, nodeManages, nodePath);
  }
  
  protected getTreeIOObject(sourceDirectory : string, dataFolder : string, treeLocation : string, treeFile : string, treeManages : any): TreeIO { 
    return new TreeIO(sourceDirectory, dataFolder, treeLocation, treeFile, treeManages);
  }

  protected getNodeIOObject(sourceDirectory: string, dataFolder: string, treeLocation : string, treeFile : string, nodeManages : any, nodePath : any): NodeIO {
    return new NodeIO(sourceDirectory, dataFolder, treeLocation, treeFile, nodeManages, nodePath)
  }

}