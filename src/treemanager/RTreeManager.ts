import { TreeManager } from './TreeManager';
import { Tree } from '../Tree/Tree';
import { TreeRepresentation } from '../treerepresentation/TreeRepresentation';
import { RTreeRepresentation } from '../treerepresentation/RTreeRepresentation';
import { RTree } from '../Tree/RTree';
import { NodeIO } from '../IO/NodeIO';
import { TreeIO } from '../IO/TreeIO';
import { WKTNodeIO } from '../IO/WKTNodeIO';

/**
 * options {
 *    sourceDirectory
 *    dataFolder
 *    treeCollectionLocation
 *    treeCollectionFile
 *    maxFragmentSize
 *    maxCachedFragments
 *    customBalancer
 *    customNormalizer
 *    }
 */
export class RTreeManager extends TreeManager{
  createTreeRepresentation(tree :Tree,
                            sourceDirectory: string,
                            dataFolder: string,
                            treeLocation: string,
                            treeFile: string,
                            maxCachedFragments: number,
                            maxFragmentSize: number,
                            nodeIO : NodeIO,
                            treeIO : TreeIO): TreeRepresentation{
    return new RTreeRepresentation(tree, 
                            sourceDirectory, 
                            dataFolder, 
                            treeLocation, 
                            treeFile,
                            maxCachedFragments, 
                            maxFragmentSize, 
                            null,
                            nodeIO, 
                            treeIO)
}

  getTreeObjectPrototype() {
    return RTree;
  }

  getNodeIOObject(sourceDirectory : string, dataFolder : string, treeLocation : string, treeFile : string, nodeManages : any, nodePath : any){
    return new WKTNodeIO(sourceDirectory, dataFolder, treeLocation, treeFile, nodeManages, nodePath)
  }
}