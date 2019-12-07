import { Member } from '../DataObjects/Member';
import { Node } from '../Node/Node';
import { Cache } from "../Cache/Cache";
import { Identifier } from '../Identifier';

export abstract class Tree {

    max_fragment_size: number;
    node_count: number;

    options : any;
    cache: Cache;
    root_node_identifier : Identifier | null;

    /**
     * Representation of a patricia tree.
     * @param {number} max_fragment_size 
     * @param {Cache} cache 
     * @param {TreeBalancer} balancer 
     */
    constructor(max_fragment_size: number, cache: Cache) {
        this.max_fragment_size = max_fragment_size;
        this.node_count = 0;

        this.cache = cache;

        this.root_node_identifier = null;
        
        this.options = {
          locale: "be"
        }
        //TODO:      When comparing large numbers of strings, such as in sorting large arrays, it is better to create an Intl.Collator object and use the function provided by its compare property.
    }

    /**
     * Provides a new unique id for this node and returns new id (does not yet set the id).
     * Node argument is unused, kept in case of needed refactor of this method.
     * @param {Node} node 
     */
    provide_node_id(): string {
        let id = this.cache.dataFolder + "node" + this.node_count.toString() + ".jsonld"
        this.node_count ++
        return id
        // return this.node_count++;
    }

    /** 
     * Returns the tree root node.
     */
    get_root_node() : Node {
        if (this.root_node_identifier === null) { throw new Error("Tree does not have a root node")}
        let rootNode = this.get_cache().get_node(this.root_node_identifier)
        if (rootNode === undefined || rootNode === null) { throw new Error("tree does not have a root node")}
        return rootNode;
    }

    /**
     * Updates the fragment of the root node (in case of rebalancing that changes root node framgent).
     * @param {Fragment} fragment 
     */
    adjust_root_node(node: Node) {
        if (this.root_node_identifier === null) { throw new Error("Cannot adjust root node fragment because root node is null")}
        this.set_root_node_identifier(new Identifier(node.get_node_id(), node.get_identifier().value))
    }

    /**
     * Adds a new fragment to this tree.
     * Fragment is added to the tree cache.
     * @param {Fragment} fragment 
     */
    addNode(node: Node) {
        this.get_cache().add_node(node);
    }

    /**
     * Adds the given data to the tree.
     * @param {Member} member 
     */
    abstract addData(representation : any, member: Member) : Node | null;

    /**
     * The given dataobject is searched in the tree.
     * For testing and debugging purposes.
     * @param {DataObject} searched_member 
     */
    abstract searchData(value : any) : Array<Member> | null;
    /**
     * Returns the tree fragment cache.
     */
    get_cache() {
        return this.cache;
    }

    createFirstNode(representation : any, member: Member | null): Node{
        let root_node = new Node(representation, null, this)
        this.set_root_node_identifier(root_node.get_identifier())
        if (member !== null){
            root_node.add_data(member);
        }
        return root_node
    }

    get_root_node_identifier() : Identifier | null{
        return this.root_node_identifier
    }
    
    set_root_node_identifier(identifier : Identifier){
        this.root_node_identifier = identifier;
    }
}

