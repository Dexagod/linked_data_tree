import { TreeManager } from './TreeManager';
import { Tree } from '../Tree/Tree';
import { TreeRepresentation } from '../treerepresentation/TreeRepresentation';
import { BTreeRepresentation } from '../treerepresentation/BTreeRepresentation';
import { BTree } from '../Tree/BTree';
import { NodeIO } from '../IO/NodeIO';

export class BTreeManager extends TreeManager{
  
  getTreeRepresentationObjectPrototype() : any{
    return BTreeRepresentation;
  }

  getTreeObjectPrototype() {
    return BTree;
  }
}