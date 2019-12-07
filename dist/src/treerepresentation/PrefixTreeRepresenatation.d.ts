import { PrefixTree } from '../Tree/PrefixTree';
import { TreeRepresentation } from './TreeRepresentation';
import { Node } from '../Node/Node';
export declare class PrefixTreeRepresentation extends TreeRepresentation {
    createNewTreeObject(maxFragmentSize: number, fc: any): PrefixTree;
    addData(representation: any, data: any, dataRepresentation?: any): Node | null;
}
