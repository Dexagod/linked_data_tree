import { Tree } from "../Tree/Tree";
import { NodeIO } from './NodeIO';
export declare class TreeIO {
    treeFile: string;
    treeLocation: string;
    sourceDirectory: string;
    dataFolder: string;
    treeManages: any;
    constructor(sourceDirectory: string, dataFolder: string, treeLocation: string, treeFile: string, treeManages: any);
    write_tree(tree: Tree, writeToFile?: boolean): any;
    read_tree(prototypeObject: any, nodeIO: NodeIO): any;
    private readTreelocation;
    private getNodeLocation;
    private getCollectionIdentifier;
    private retrieveNodeIdentifier;
}
