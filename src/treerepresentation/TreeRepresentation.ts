import { Tree } from '../Tree/Tree';
import { Cache } from "../Cache/Cache"
import { Member } from "../DataObjects/Member"
import { NodeIO } from '../IO/NodeIO';
import { Node } from '../Node/Node';
export abstract class TreeRepresentation{
    tree : Tree;
    sourceDirectory : string;
    dataFolder : string;

    constructor(tree: Tree | null | undefined, 
                sourceDirectory: string, 
                dataFolder: string, 
                maxCachedFragments: number, 
                maxFragmentSize: number, 
                nodeIO : NodeIO){

        if (tree === undefined || tree === null){
            var fc = new Cache(sourceDirectory, dataFolder, maxCachedFragments, nodeIO);
            this.tree = this.createNewTreeObject(maxFragmentSize, fc)
        } else {
            this.tree = tree;
        }

        this.sourceDirectory = sourceDirectory;
        this.dataFolder = dataFolder;
    }

    abstract createNewTreeObject(maxFragmentSize : number, fc : Cache) : Tree;

    /**
     * Add given data to the tree in the node of the representation.
     * @param {string} representation 
     * @param {any} data 
     */
    addData(representation: any, data: any, dataRepresentation : any = representation, triplesSize: number = 1) : Node | null {
        return this.tree.addData(representation, new Member(dataRepresentation, data, triplesSize))
    }

    searchData(value: any) : Member[] | null{
        return this.tree.searchData(value)
    }

    searchNode(value: any) : Node[] {
        return this.tree.searchNode(value)
    }
    
  
    /**
     * Indicate finished adding data.
     * Cache can be flushed.
     */
    doneAdding(writeToFile : boolean = true) : any{
        return this.tree.get_cache().flush_cache(this.getTreeObject());
    }

    getTreeObject() : Tree {
        return this.tree
    }

}