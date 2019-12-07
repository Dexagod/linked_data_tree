import { Tree } from '../Tree/Tree';
import { Cache } from "../Cache/Cache";
import { Member } from "../DataObjects/Member";
import { NodeIO } from '../IO/NodeIO';
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
    addData(representation: any, data: any, dataRepresentation?: any): void;
    searchData(value: any): Member[] | null;
    /**
     * Indicate finished adding data.
     * Cache can be flushed.
     */
    doneAdding(writeToFile?: boolean): any;
    getTreeObject(): Tree;
}
