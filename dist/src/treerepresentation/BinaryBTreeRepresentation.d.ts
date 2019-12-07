import { TreeRepresentation } from './TreeRepresentation';
import { Cache } from '../Cache/Cache';
import { Tree } from '../Tree/Tree';
import { Node } from '../Node/Node';
export declare class BinaryBTreeRepresentation extends TreeRepresentation {
    createNewTreeObject(maxFragmentSize: number, fc: Cache): Tree;
    addData(representation: any, data: any, dataRepresentation?: any): Node | null;
}
