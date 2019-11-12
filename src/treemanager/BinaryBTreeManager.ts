import { TreeManager } from './TreeManager';
import { Tree } from '../Tree/Tree';
import { TreeRepresentation } from '../treerepresentation/TreeRepresentation';
import { BinaryBTreeRepresentation } from '../treerepresentation/BinaryBTreeRepresentation';
import { TreeIO } from '../IO/TreeIO';
import { BinaryBTree } from '../Tree/BinaryBTree';
import { NodeIO } from '../IO/NodeIO';
import { Normalizer } from '../CustomWordNormalizer';
export class BinaryBTreeManager extends TreeManager{
  createTreeRepresentation(tree :Tree,
                            sourceDirectory: string,
                            dataFolder: string,
                            treeLocation: string,
                            treeFile: string,
                            maxCachedFragments: number,
                            maxFragmentSize: number,
                            nodeIO : NodeIO,
                            treeIO : TreeIO): TreeRepresentation{
    return new BinaryBTreeRepresentation(tree, 
                            sourceDirectory, 
                            dataFolder, 
                            treeLocation, 
                            treeFile,
                            maxCachedFragments, 
                            maxFragmentSize, 
                            new Normalizer().normalize, 
                            nodeIO, 
                            treeIO)
  }

  getTreeObjectPrototype() {
    return BinaryBTree;
  }
}