import { PrefixTree } from '../Tree/PrefixTree';
import { TreeManager } from './TreeManager';
import { Tree } from '../Tree/Tree';
import { TreeRepresentation } from '../treerepresentation/TreeRepresentation';
import { PrefixTreeRepresentation } from '../treerepresentation/PrefixTreeRepresenatation';
import { NodeIO } from '../IO/NodeIO';

export class PrefixTreeManager extends TreeManager{

  getTreeRepresentationObjectPrototype() : any{
    return PrefixTreeRepresentation;
  }

  getTreeObjectPrototype() : any {
    return PrefixTree;
  }

}