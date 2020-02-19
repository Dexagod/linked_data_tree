import { Tree } from './Tree';
import { Member } from '../DataObjects/Member';
import { Node } from '../Node/Node';
export declare class PrefixTree extends Tree {
    /**
    * Adds the given data to the tree.
    * @param {Member} member
    */
    count: number;
    addData(representation: any, member: Member): Node | null;
    private recursiveAddition;
    private splitNode;
    /**
    * The given dataobject is searched in the tree.
    * For testing and debugging purposes.
    * @param {DataObject} searched_member
    */
    searchData(value: any): Member[];
    searchNode(value: any): Node[];
    private _search_data_recursive;
}
