"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Node_1 = require("../Node/Node");
var Identifier_1 = require("../Identifier");
var Tree = /** @class */ (function () {
    /**
     * Representation of a patricia tree.
     * @param {number} max_fragment_size
     * @param {Cache} cache
     * @param {TreeBalancer} balancer
     */
    function Tree(max_fragment_size, cache) {
        this.max_fragment_size = max_fragment_size;
        this.node_count = 0;
        this.cache = cache;
        this.root_node_identifier = null;
        this.options = {
            locale: "be"
        };
        //TODO:      When comparing large numbers of strings, such as in sorting large arrays, it is better to create an Intl.Collator object and use the function provided by its compare property.
    }
    /**
     * Provides a new unique id for this node and returns new id (does not yet set the id).
     * Node argument is unused, kept in case of needed refactor of this method.
     * @param {Node} node
     */
    Tree.prototype.provide_node_id = function () {
        var id = "/" + this.cache.dataFolder + "node" + this.node_count.toString() + ".jsonld";
        if (this.node_count > 0) {
            var nodefolder = (Math.ceil(this.node_count / 1000)).toString();
            id = "/" + this.cache.dataFolder + nodefolder + "/node" + this.node_count.toString() + ".jsonld";
        }
        this.node_count++;
        return id;
        // return this.node_count++;
    };
    /**
     * Returns the tree root node.
     */
    Tree.prototype.get_root_node = function () {
        if (this.root_node_identifier === null) {
            throw new Error("Tree does not have a root node");
        }
        var rootNode = this.get_cache().get_node(this.root_node_identifier);
        if (rootNode === undefined || rootNode === null) {
            throw new Error("tree does not have a root node");
        }
        return rootNode;
    };
    /**
     * Updates the fragment of the root node (in case of rebalancing that changes root node framgent).
     * @param {Fragment} fragment
     */
    Tree.prototype.adjust_root_node = function (node) {
        if (this.root_node_identifier === null) {
            throw new Error("Cannot adjust root node fragment because root node is null");
        }
        this.set_root_node_identifier(new Identifier_1.Identifier(node.get_node_id(), node.get_identifier().value));
    };
    /**
     * Adds a new fragment to this tree.
     * Fragment is added to the tree cache.
     * @param {Fragment} fragment
     */
    Tree.prototype.addNode = function (node) {
        this.get_cache().add_node(node);
    };
    /**
     * Returns the tree fragment cache.
     */
    Tree.prototype.get_cache = function () {
        return this.cache;
    };
    Tree.prototype.createFirstNode = function (representation, member) {
        var root_node = new Node_1.Node(representation, null, this);
        this.set_root_node_identifier(root_node.get_identifier());
        if (member !== null) {
            root_node.add_data(member);
        }
        return root_node;
    };
    Tree.prototype.get_root_node_identifier = function () {
        return this.root_node_identifier;
    };
    Tree.prototype.set_root_node_identifier = function (identifier) {
        this.root_node_identifier = identifier;
    };
    // checkNodeSplit(node: Node) : boolean{
    //     if (node.get_members().map(e=>e.size).reduce((a:number, b:number) => a+b, 0) > this.max_fragment_size) {
    //         return true
    //     }
    //     return false;
    // }
    Tree.prototype.checkNodeSplit = function (node) {
        if (node.get_members().length > this.max_fragment_size) {
            return true;
        }
        return false;
    };
    return Tree;
}());
exports.Tree = Tree;
//# sourceMappingURL=Tree.js.map