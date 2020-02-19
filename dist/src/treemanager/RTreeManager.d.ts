import { TreeManager } from './TreeManager';
import { RTree } from '../Tree/RTree';
import { WKTNodeIO } from '../IO/WKTNodeIO';
/**
 * options {
 *    sourceDirectory
 *    dataFolder
 *    maxFragmentSize
 *    maxCachedFragments
 *    }
 */
export declare class RTreeManager extends TreeManager {
    getTreeRepresentationObjectPrototype(): any;
    getTreeObjectPrototype(): typeof RTree;
    getNodeIOObject(sourceDirectory: string, dataFolder: string, nodePath: any): WKTNodeIO;
}
