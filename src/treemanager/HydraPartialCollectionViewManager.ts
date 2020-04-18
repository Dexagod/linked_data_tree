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
 
  getTreeRepresentationObjectPrototype() : any{
    return HydraPartialCollectionViewRepresentation;
  }

  getTreeObjectPrototype() {
    return HydraPartialCollectionView;
  }

  getNodeIOObjectPrototype(): any {
    return HydraNodeIO;
  }
}