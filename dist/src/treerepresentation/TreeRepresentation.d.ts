import { Tree } from '../Tree/Tree';
import { Cache } from "../Cache/Cache";
import { Member } from "../DataObjects/Member";
import { NodeIO } from '../IO/NodeIO';
import { Node } from '../Node/Node';
export declare abstract class TreeRepresentation {
    tree: Tree;
    sourceDirectory: string;
    dataFolder: string;
    constructor(tree: Tree | null | undefined, sourceDirectory: string, dataFolder: string, maxCachedFragments: number, maxFragmentSize: number, nodeIO: NodeIO);
    abstract createNewTreeObject(maxFragmentSize: number, fc: Cache): Tree;
    /**
     * Add given data to the tree in the node of the representation.
     * @param {string} representation
     * @param {any} data
     */
    addData(representation: any, data: any, triplesSize?: number, dataRepresentation?: any): Node | null;
    searchData(value: any): Member[] | null;
    searchNode(value: any): Node[];
    /**
     * Indicate finished adding data.
     * Cache can be flushed.
     */
    doneAdding(writeToFile?: boolean): any;
    getTreeObject(): Tree;
}
