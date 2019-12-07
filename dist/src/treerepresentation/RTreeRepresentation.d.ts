import { TreeRepresentation } from './TreeRepresentation';
import { Cache } from '../Cache/Cache';
import { Tree } from '../Tree/Tree';
export declare class RTreeRepresentation extends TreeRepresentation {
    createNewTreeObject(maxFragmentSize: number, fc: Cache): Tree;
    addData(representation: any, data: any, dataRepresentation?: any): void;
}
