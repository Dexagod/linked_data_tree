import { Tree } from './Tree';
import { Member } from '../DataObjects/Member';
import { Node } from '../Node/Node';
export declare class RTree extends Tree {
    addData(representation: any, member: Member): Node | null;
    private recursiveAddition;
    addMemberToNode(currentNode: Node, member: Member): Node;
    searchData(value: any): Member[];
    searchNode(value: any): Array<Node>;
    private _search_data_recursive;
    private findClosestBoundingBoxIndex;
    private splitNode;
    private splitLeafNode;
    private splitInnerNode;
    private createBoundingBox;
    private bboxToGeoJSON;
    private expandBoundingBox;
    private getBBoxSize;
    private getBBox;
    private findContainingChild;
    private findContainingOrOverlappingChildren;
    private isContained;
    private isOverlapping;
    private chooseAxis;
    private pickSeeds;
}
