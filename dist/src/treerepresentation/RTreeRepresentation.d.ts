import { TreeRepresentation } from './TreeRepresentation';
import { Cache } from '../Cache/Cache';
import { Tree } from '../Tree/Tree';
import { Member } from '../DataObjects/Member';
import { Node } from '../Node/Node';
export declare class RTreeRepresentation extends TreeRepresentation {
    createNewTreeObject(maxFragmentSize: number, fc: Cache): Tree;
    addData(representation: any, data: any, triplesSize?: number, dataRepresentation?: any): Node | null;
    searchData(value: any): Member[] | null;
}
