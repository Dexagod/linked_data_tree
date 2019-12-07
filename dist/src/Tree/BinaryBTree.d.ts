import { Tree } from './Tree';
import { Member } from '../DataObjects/Member';
import { Node } from '../Node/Node';
import { Interval } from '../Interval';
export declare class BinaryBTree extends Tree {
    /**
     * Adds the given data to the tree.
     * @param {Member} member
     */
    addData(representation: any, member: Member): Node | null;
    nodePath: Array<Node>;
    private recursiveAddition;
    private getIntervals;
    splitLeafNode(node: Node, interval: Interval, value: any): Node;
    splitInternalNode(node: Node, value: any): Node;
    swapNodeChildWithNewChildren(parent: Node, oldNode: Node, smallChildrenNode: Node, largeChildrenNode: Node, splitValue: number): Node;
    private addToIntervalMap;
    private createRelation;
    private checkRelationsMinMax;
    private comparisonFunction;
    private memberNameComparisonFunction;
    /**
    * The given dataobject is searched in the tree.
    * For testing and debugging purposes.
    * @param {DataObject} searched_member
    */
    searchData(value: any): Member[];
    private _search_data_recursive;
}
