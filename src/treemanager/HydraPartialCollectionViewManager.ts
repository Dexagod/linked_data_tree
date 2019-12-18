import { TreeManager } from './TreeManager';
import { Tree } from '../Tree/Tree';
import { TreeRepresentation } from '../treerepresentation/TreeRepresentation';
import { RTreeRepresentation } from '../treerepresentation/RTreeRepresentation';
import { RTree } from '../Tree/RTree';
import { NodeIO } from '../IO/NodeIO';
import { WKTNodeIO } from '../IO/WKTNodeIO';
import { HydraPartialCollectionViewRepresentation } from '../treerepresentation/HydraPartialCollectionViewRepresentation';
import { HydraPartialCollectionView } from '../Tree/HydraPartialCollectionView';
import { HydraNodeIO } from '../IO/HydraNodeIO';

/**
 * options {
 *    sourceDirectory
 *    dataFolder
 *    maxFragmentSize
 *    maxCachedFragments
 *    }
 */
export class HydraPartialCollectionViewManager extends TreeManager{
  createTreeRepresentation(tree :Tree,
                            sourceDirectory: string,
                            dataFolder: string,
                            maxCachedFragments: number,
                            maxFragmentSize: number,
                            nodeIO : NodeIO): TreeRepresentation{
    return new HydraPartialCollectionViewRepresentation(tree, 
                            sourceDirectory, 
                            dataFolder, 
                            maxCachedFragments, 
                            maxFragmentSize, 
                            nodeIO)
}

  getTreeObjectPrototype() {
    return HydraPartialCollectionView;
  }

  getNodeIOObject(sourceDirectory : string, dataFolder : string, nodePath : any){
    return new HydraNodeIO(sourceDirectory, dataFolder, nodePath)
  }
}