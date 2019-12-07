import {
  TreeRepresentation
} from "../treerepresentation/TreeRepresentation";
import {
  Tree
} from '../Tree/Tree';
import { 
  NodeIO
} from '../IO/NodeIO';

export abstract class TreeManager {

  nodeIO : NodeIO | null;

  constructor(){
    this.nodeIO = null;
  }

  /** 
   * Gets the tree object from the given location.
   * @param {string} sourceDirectory - base folder of the tree data
   * @param {*} dataFolder - folder containing the fragment files in the sourceDirectory
   * @param {*} maxCachedFragments - maximal cachable fragments at once
   */
  readTree(sourceDirectory: string,
                dataFolder: string,
                nodeShaclPath: any,
                maxCachedFragments: number,
                maxFragmentSize: number): TreeRepresentation {
    let nodeIO = this.getNodeIO(sourceDirectory, dataFolder, nodeShaclPath)
    let tree = nodeIO.readTree(this.getTreeObjectPrototype());
    return this.createTreeRepresentation(tree,
                                          sourceDirectory, 
                                          dataFolder, 
                                          maxCachedFragments, 
                                          maxFragmentSize, 
                                          nodeIO);
  }

  /**
   * Creates a new tree object.
   * @param {string} sourceDirectory - base forlder of the tree data
   * @param {string} dataFolder - folder containing the fragment files in the sourceDirectory
   * @param {number} maxCachedFragments - the maximal amount of elements in the cache
   */

  createTree(sourceDirectory: string,
                dataFolder: string,
                nodeShaclPath: any,
                maxCachedFragments: number,
                maxFragmentSize: number): TreeRepresentation {
    return this.createTreeRepresentation(null,
                                          sourceDirectory, 
                                          dataFolder, 
                                          maxCachedFragments, 
                                          maxFragmentSize, 
                                          this.getNodeIO(sourceDirectory, dataFolder, nodeShaclPath));
  }


  abstract createTreeRepresentation(tree : Tree | null,
                                      sourceDirectory: string,
                                      dataFolder: string,
                                      maxCachedFragments: number,
                                      maxFragmentSize: number,
                                      nodeIO : NodeIO): TreeRepresentation

  abstract getTreeObjectPrototype(): any;

  private getNodeIO(sourceDirectory: string, dataFolder: string, nodePath : any): NodeIO {
    return this.getNodeIOObject(sourceDirectory, dataFolder, nodePath);
  }

  protected getNodeIOObject(sourceDirectory: string, dataFolder: string, nodePath : any): NodeIO {
    return new NodeIO(sourceDirectory, dataFolder, nodePath)
  }

}