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
    let nodeIO = this.getNodeIO(sourceDirectory, dataFolder, nodeShaclPath, true)
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
                maxFragmentSize: number,
                writeMetadata:boolean = true): TreeRepresentation {
    return this.createTreeRepresentation(null,
                                          sourceDirectory, 
                                          dataFolder, 
                                          maxCachedFragments, 
                                          maxFragmentSize, 
                                          this.getNodeIO(sourceDirectory, dataFolder, nodeShaclPath, writeMetadata));
  }

  abstract getTreeRepresentationObjectPrototype(): any;

  createTreeRepresentation(tree : Tree | null,
    sourceDirectory: string,
    dataFolder: string,
    maxCachedFragments: number,
    maxFragmentSize: number,
    nodeIO : NodeIO): TreeRepresentation {
      let treeRepresentationObjectPrototype = this.getTreeRepresentationObjectPrototype();
      return new treeRepresentationObjectPrototype(tree, sourceDirectory, dataFolder, maxCachedFragments, maxFragmentSize, nodeIO)
    }

  abstract getTreeObjectPrototype(): any;

  private getNodeIO(sourceDirectory: string, dataFolder: string, nodePath : any, writeMetadata : boolean): NodeIO {
    return this.getNodeIOObject(sourceDirectory, dataFolder, nodePath, writeMetadata);
  }

  protected getNodeIOObject(sourceDirectory: string, dataFolder: string, nodePath : any, writeMetadata : boolean): NodeIO {
    return new NodeIO(sourceDirectory, dataFolder, nodePath, writeMetadata)
  }

}