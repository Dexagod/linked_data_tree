import { TreeManager } from './TreeManager';
import { Tree } from '../Tree/Tree';
import { TreeRepresentation } from '../treerepresentation/TreeRepresentation';
import { BinaryBTreeRepresentation } from '../treerepresentation/BinaryBTreeRepresentation';
import { BinaryBTree } from '../Tree/BinaryBTree';
import { NodeIO } from '../IO/NodeIO';

export class BinaryBTreeManager extends TreeManager{
  createTreeRepresentation(tree :Tree,
                            sourceDirectory: string,
                            dataFolder: string,
                            maxCachedFragments: number,
                            maxFragmentSize: number,
                            nodeIO : NodeIO): TreeRepresentation{
    return new BinaryBTreeRepresentation(tree, 
                            sourceDirectory, 
                            dataFolder, 
                            maxCachedFragments, 
                            maxFragmentSize, 
                            nodeIO)
  }

  getTreeObjectPrototype() {
    return BinaryBTree;
  }
}