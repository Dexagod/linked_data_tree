import { Member } from '../DataObjects/Member';
import { Node } from '../Node/Node';
import { Cache } from "../Cache/Cache";
import { Identifier } from '../Identifier';
export declare abstract class Tree {
    max_fragment_size: number;
    node_count: number;
    options: any;
    cache: Cache;
    root_node_identifier: Identifier | null;
    /**
     * Representation of a patricia tree.
     * @param {number} max_fragment_size
     * @param {Cache} cache
     * @param {TreeBalancer} balancer
     */
    constructor(max_fragment_size: number, cache: Cache);
    /**
     * Provides a new unique id for this node and returns new id (does not yet set the id).
     * Node argument is unused, kept in case of needed refactor of this method.
     * @param {Node} node
     */
    provide_node_id(): string;
    /**
     * Returns the tree root node.
     */
    get_root_node(): Node;
    /**
     * Updates the fragment of the root node (in case of rebalancing that changes root node framgent).
     * @param {Fragment} fragment
     */
    adjust_root_node(node: Node): void;
    /**
     * Adds a new fragment to this tree.
     * Fragment is added to the tree cache.
     * @param {Fragment} fragment
     */
    addNode(node: Node): void;
    /**
     * Adds the given data to the tree.
     * @param {Member} member
     */
    abstract addData(representation: any, member: Member): Node | null;
    /**
     * The given dataobject is searched in the tree.
     * For testing and debugging purposes.
     * @param {DataObject} searched_member
     */
    abstract searchData(value: any): Array<Member> | null;
    /**
     * Returns the tree fragment cache.
     */
    abstract searchNode(value: any): Array<Node>;
    /**
     * Returns the tree fragment cache.
     */
    get_cache(): Cache;
    createFirstNode(representation: any, member: Member | null): Node;
    get_root_node_identifier(): Identifier | null;
    set_root_node_identifier(identifier: Identifier): void;
    checkNodeSplit(node: Node): boolean;
}
