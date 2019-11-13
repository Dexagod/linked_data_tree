import { Tree } from '../Tree/Tree';
import { Cache } from "../Cache/Cache"
import { Member } from "../DataObjects/Member"
import { TreeIO } from '../IO/TreeIO';
import { NodeIO } from '../IO/NodeIO';
export abstract class TreeRepresentation{
    tree : Tree;
    sourceDirectory : string;
    dataFolder : string;
    treeLocation : string;
    treeFile : string;
    treeIO : TreeIO;
    customNormalizer : Function;

    constructor(tree: Tree | null | undefined, 
                sourceDirectory: string, 
                dataFolder: string, 
                treeLocation : string, 
                treeFile : string, 
                maxCachedFragments: number, 
                maxFragmentSize: number, 
                customNormalizer : Function | null,
                nodeIO : NodeIO,
                treeIO : TreeIO){

        if (tree === undefined || tree === null){
            var fc = new Cache(sourceDirectory, dataFolder, maxCachedFragments, nodeIO);
            this.tree = this.createNewTreeObject(maxFragmentSize, fc)
        } else {
            this.tree = tree;
        }

        if (customNormalizer === null){
            this.customNormalizer = function(e : any){ return e }
        } else {
            this.customNormalizer = customNormalizer;
        }

        this.sourceDirectory = sourceDirectory;
        this.dataFolder = dataFolder;
        this.treeLocation = treeLocation;
        this.treeFile = treeFile;
        this.treeIO = treeIO;
    }

    abstract createNewTreeObject(maxFragmentSize : number, fc : Cache) : Tree;

    /**
     * Add given data to the tree in the node of the representation.
     * @param {string} representation 
     * @param {any} data 
     */
    addData(representation: any, data: any, dataRepresentation = representation) {
      representation = this.customNormalizer(representation)
      let newmember = new Member(dataRepresentation, data)
      this.tree.addData(representation, newmember)
    }
    
    searchData(value: any) : Member[] | null{
        return this.tree.searchData(this.customNormalizer(value))
    }
    
  
    /**
     * Indicate finished adding data.
     * Cache can be flushed.
     */
    doneAdding(writeToFile : boolean = true) : any{
        return this.tree.get_cache().flush_cache(this.getTreeObject());
        // return this.treeIO.write_tree(this.getTreeObject(), writeToFile);
    }

    getTreeObject() : Tree {
        return this.tree
    }

}