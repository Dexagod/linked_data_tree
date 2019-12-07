import { TreeManager } from './TreeManager';
import { Tree } from '../Tree/Tree';
import { TreeRepresentation } from '../treerepresentation/TreeRepresentation';
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
export declare class RTreeManager extends TreeManager {
    createTreeRepresentation(tree: Tree, sourceDirectory: string, dataFolder: string, maxCachedFragments: number, maxFragmentSize: number, nodeIO: NodeIO): TreeRepresentation;
    getTreeObjectPrototype(): typeof RTree;
    getNodeIOObject(sourceDirectory: string, dataFolder: string, nodePath: any): WKTNodeIO;
}
