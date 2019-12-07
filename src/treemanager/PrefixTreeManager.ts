import { PrefixTree } from '../Tree/PrefixTree';
import { TreeManager } from './TreeManager';
import { Tree } from '../Tree/Tree';
import { TreeRepresentation } from '../treerepresentation/TreeRepresentation';
import { PrefixTreeRepresentation } from '../treerepresentation/PrefixTreeRepresenatation';
import { NodeIO } from '../IO/NodeIO';

export class PrefixTreeManager extends TreeManager{
  createTreeRepresentation(tree :Tree,
    sourceDirectory: string,
    dataFolder: string,
    maxCachedFragments: number,
    maxFragmentSize: number,
    nodeIO : NodeIO): TreeRepresentation{
return new PrefixTreeRepresentation(tree, 
    sourceDirectory, 
    dataFolder, 
    maxCachedFragments, 
    maxFragmentSize, 
    nodeIO)
}

  getTreeObjectPrototype() : any {
    return PrefixTree;
  }

}