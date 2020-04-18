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

  getTreeRepresentationObjectPrototype() : any{
    return RTreeRepresentation;
  }

  getTreeObjectPrototype() {
    return RTree;
  }

  getNodeIOObjectPrototype(): any{
    return WKTNodeIO;
  }
}