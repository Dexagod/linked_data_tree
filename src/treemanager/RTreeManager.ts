import { TreeManager } from './TreeManager';
import { Tree } from '../Tree/Tree';
import { TreeRepresentation } from '../treerepresentation/TreeRepresentation';
import { RTreeRepresentation } from '../treerepresentation/RTreeRepresentation';
import { RTree } from '../Tree/RTree';
import { NodeIO } from '../IO/NodeIO';
import { WKTNodeIO } from '../IO/WKTNodeIO';

/**
 * options {
 *    sourceDirectory
 *    dataFolder
 *    maxFragmentSize
 *    maxCachedFragments
 *    }
 */
export class RTreeManager extends TreeManager{
  createTreeRepresentation(tree :Tree,
                            sourceDirectory: string,
                            dataFolder: string,
                            maxCachedFragments: number,
                            maxFragmentSize: number,
                            nodeIO : NodeIO): TreeRepresentation{
    return new RTreeRepresentation(tree, 
                            sourceDirectory, 
                            dataFolder, 
                            maxCachedFragments, 
                            maxFragmentSize, 
                            nodeIO)
}

  getTreeObjectPrototype() {
    return RTree;
  }

  getNodeIOObject(sourceDirectory : string, dataFolder : string, nodePath : any){
    return new WKTNodeIO(sourceDirectory, dataFolder, nodePath)
  }
}