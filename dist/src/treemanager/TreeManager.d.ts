import { TreeRepresentation } from "../treerepresentation/TreeRepresentation";
import { Tree } from '../Tree/Tree';
import { NodeIO } from '../IO/NodeIO';
export declare abstract class TreeManager {
    nodeIO: NodeIO | null;
    constructor();
    /**
     * Gets the tree object from the given location.
     * @param {string} sourceDirectory - base folder of the tree data
     * @param {*} dataFolder - folder containing the fragment files in the sourceDirectory
     * @param {*} maxCachedFragments - maximal cachable fragments at once
     */
    readTree(sourceDirectory: string, dataFolder: string, nodeShaclPath: any, maxCachedFragments?: number, maxFragmentSize?: number): TreeRepresentation;
    /**
     * Creates a new tree object.
     * @param {string} sourceDirectory - base forlder of the tree data
     * @param {string} dataFolder - folder containing the fragment files in the sourceDirectory
     * @param {number} maxCachedFragments - the maximal amount of elements in the cache
     */
    createTree(sourceDirectory: string, dataFolder: string, nodeShaclPath: any, maxCachedFragments: number, maxFragmentSize: number, writeMetadata?: boolean): TreeRepresentation;
    abstract getTreeRepresentationObjectPrototype(): any;
    createTreeRepresentation(tree: Tree | null, sourceDirectory: string, dataFolder: string, maxCachedFragments: number, maxFragmentSize: number, nodeIO: NodeIO): TreeRepresentation;
    abstract getTreeObjectPrototype(): any;
    private getNodeIO;
    protected getNodeIOObject(sourceDirectory: string, dataFolder: string, nodePath: any, writeMetadata: boolean): NodeIO;
}
