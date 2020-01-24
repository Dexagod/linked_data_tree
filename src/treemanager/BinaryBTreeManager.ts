import { TreeManager } from './TreeManager';
import { Tree } from '../Tree/Tree';
import { TreeRepresentation } from '../treerepresentation/TreeRepresentation';
import { BinaryBTreeRepresentation } from '../treerepresentation/BinaryBTreeRepresentation';
import { BinaryBTree } from '../Tree/BinaryBTree';
import { NodeIO } from '../IO/NodeIO';

export class BinaryBTreeManager extends TreeManager{
  
  getTreeRepresentationObjectPrototype() : any{
    return BinaryBTreeRepresentation;
  }

  getTreeObjectPrototype() {
    return BinaryBTree;
  }
}