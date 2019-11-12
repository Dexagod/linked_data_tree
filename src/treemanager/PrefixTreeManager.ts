import { PrefixTree } from '../Tree/PrefixTree';
import { TreeManager } from './TreeManager';
import { Tree } from '../Tree/Tree';
import { TreeIO } from '../IO/TreeIO';
import { TreeRepresentation } from '../treerepresentation/TreeRepresentation';
import { PrefixTreeRepresentation } from '../treerepresentation/PrefixTreeRepresenatation';
import { NodeIO } from '../IO/NodeIO';
import { Normalizer } from '../CustomWordNormalizer';

export class PrefixTreeManager extends TreeManager{
  createTreeRepresentation(tree :Tree,
    sourceDirectory: string,
    dataFolder: string,
    treeLocation: string,
    treeFile: string,
    maxCachedFragments: number,
    maxFragmentSize: number,
    nodeIO : NodeIO,
    treeIO : TreeIO): TreeRepresentation{
return new PrefixTreeRepresentation(tree, 
    sourceDirectory, 
    dataFolder, 
    treeLocation, 
    treeFile,
    maxCachedFragments, 
    maxFragmentSize, 
    new Normalizer().normalize, 
    nodeIO, 
    treeIO,)
}

  getTreeObjectPrototype() : any {
    return PrefixTree;
  }

}