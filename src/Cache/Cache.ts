var fs = require('fs')
import { Node } from "../Node/Node"
import { NodeIO } from "../IO/NodeIO"
import { Identifier } from "../Identifier";
import { Tree } from '../Tree/Tree';

export class Cache {
    cache: Map<string, Node>;
    last_used_cache_counter: number;
    cache_hits: Map<string, number>;
    nodeLocationFolder: string;
    max_cache_size: number;
    sourceDirectory: string;
    dataFolder: string;

    cache_misses: number;
    cache_cleans: number;
    writes: number;
    reads: number;

    CACHE_CUTOFF_DIVISOR: number;
    nodeIO: any;

    /**
     * This class acts as a cache for all the Fragment objects.
     * @param {string} sourceDirectory - Root folder of the tree data.
     * @param {string} dataFolder - Folder containing the fragment data.
     * @param {number} max_cache_size - Max amount of items allowed in the cache.
     */
    constructor(sourceDirectory: string, dataFolder: string, max_cache_size = 1000, nodeIO: NodeIO) {
        this.cache = new Map();
        this.last_used_cache_counter = 0
        this.cache_hits = new Map();
        this.nodeLocationFolder = sourceDirectory + dataFolder;
        this.max_cache_size = max_cache_size;
        this.sourceDirectory = sourceDirectory;
        this.dataFolder = dataFolder;

        this.cache_misses = 0;
        this.cache_cleans = 0;
        this.writes = 0;
        this.reads = 0;

        this.CACHE_CUTOFF_DIVISOR = 3;

        // Create dirs if non existent.
        if (!fs.existsSync(sourceDirectory)) {
            fs.mkdirSync(sourceDirectory, {recursive : true});  
        }
        if (!fs.existsSync(this.nodeLocationFolder)) {
            fs.mkdirSync(this.nodeLocationFolder, {recursive : true});
        }
        this.nodeIO = nodeIO;
    }

    add_node(node: Node) {
        this.cache.set(node.get_node_id(), node);
        this.cache_hits.set(node.get_node_id(), this.assign_cache_counter());

        // Clean cache on overflow
        if (Object.keys(this.cache).length > this.max_cache_size) {
            this.clean_cache()
        }
    }

    /** 
     * cache counter to keep track of lru items.
     */
    assign_cache_counter() {
        this.last_used_cache_counter += 1;
        return this.last_used_cache_counter;
    }

    get_node_by_id(nodeId: string) : Node {
        if (nodeId === undefined) { throw new Error("requesting non-existing identifyer")}
        if (this.cache.has(nodeId)) {
            this.cache_hits.set(nodeId, this.assign_cache_counter());
            return this.getNodeFromCache(nodeId);
        } else {
            this.cache_misses += 1
            return this.import_node(nodeId);
        }
    }

    get_node(identifier : Identifier) : Node{
        return this.get_node_by_id(identifier.nodeId);
    }

    list_nodes(): Array <Node> {
        let fc = this;
        var values = Object.keys(this.cache).map(function (key): Node {
            return fc.getNodeFromCache(key);
        });
        return values;
    }

    delete_node(node: Node) : void {
        this.cache.delete(node.get_node_id());
        this.cache_hits.delete(node.get_node_id());
    }

    delete_node_file_by_id(nodeId: string) : void {
        this.nodeIO.delete_node(nodeId);
    }

    import_node(nodeId: string) : Node{
        let node = this.read_node_from_file(nodeId);
        this.add_node(node);
        return node;
    }

    read_node_from_file(nodeId: string) : Node{
        this.reads += 1;
        let result = this.nodeIO.read_node(nodeId, this);
        return result;
    }

    write_node_to_file(node: Node) : void {
        this.writes += 1;
        this.cache.delete(node.get_node_id());
        return this.nodeIO.write_node(node)
    }

    write_node_batch_to_file(index_array: Array<string>) : void{
        this.writes += index_array.length;

        const mapped_array: Array<Node> = index_array.map(e => this.getNodeFromCache(e))
        const write_array = []
        for (var i = 0; i < index_array.length; i++) {
            this.cache.delete(index_array[i]);
            write_array.push(mapped_array[i])
        }

        this.nodeIO.write_node_batch(write_array)
    }


    clean_cache() {
        
        this.cache_cleans += 1;

        let cache_values: Array<Array<any>> = new Array()

        for (var key in this.cache) cache_values.push([key, this.getCacheHits(key)])

        cache_values.sort(function (a, b) {
            let x = a[1];
            let y = b[1];
            return x < y ? -1 : (x > y ? 1 : 0);
        });

        let cutoff_length = Math.ceil(cache_values.length / this.CACHE_CUTOFF_DIVISOR)

        let index_array = cache_values.slice(0, cutoff_length)
        const mapped_index = index_array.map(e => e[0])
        this.write_node_batch_to_file(mapped_index)
    }

    flush_cache(tree : Tree) {
        let keyArray = Array.from(this.cache.keys())
        this.write_node_batch_to_file(keyArray)
        this.nodeIO.writeTreeMetadata(tree)
    }

    getNodeFromCache(nodeId: string): Node{
      let node = this.cache.get(nodeId);
      if (node === undefined || node === null) throw new Error("Requested id is not in the node cache or is null")
      return node;
    }
    
    getCacheHits(nodeId: string): number{
      let hits = this.cache_hits.get(nodeId);
      if (hits === undefined || hits === null) throw new Error("Requested cache hits are not present in the cache or is null for requested id")
      return hits;
    }

}