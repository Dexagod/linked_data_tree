import { TreeManager } from './TreeManager';
import { Tree } from '../Tree/Tree';
import { TreeRepresentation } from '../treerepresentation/TreeRepresentation';
import { BinaryBTree } from '../Tree/BinaryBTree';
import { NodeIO } from '../IO/NodeIO';
export declare class BinaryBTreeManager extends TreeManager {
    createTreeRepresentation(tree: Tree, sourceDirectory: string, dataFolder: string, maxCachedFragments: number, maxFragmentSize: number, nodeIO: NodeIO): TreeRepresentation;
    getTreeObjectPrototype(): typeof BinaryBTree;
}
