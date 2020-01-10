import { Node } from "../Node/Node";
import { NodeIO } from "../IO/NodeIO";
import { Identifier } from "../Identifier";
import { Tree } from '../Tree/Tree';
export declare class Cache {
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
    constructor(sourceDirectory: string, dataFolder: string, max_cache_size: number | undefined, nodeIO: NodeIO);
    add_node(node: Node): void;
    /**
     * cache counter to keep track of lru items.
     */
    assign_cache_counter(): number;
    get_node_by_id(nodeId: string): Node;
    get_node(identifier: Identifier): Node;
    list_nodes(): Array<Node>;
    delete_node(node: Node): void;
    delete_node_file_by_id(nodeId: string): void;
    import_node(nodeId: string): Node;
    read_node_from_file(nodeId: string): Node;
    write_node_to_file(node: Node): void;
    write_node_batch_to_file(index_array: Array<string>): void;
    clean_cache(): void;
    flush_cache(tree: Tree): any;
    getNodeFromCache(nodeId: string): Node;
    getCacheHits(nodeId: string): number;
}
