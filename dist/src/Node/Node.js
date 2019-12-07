"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Identifier_1 = require("../Identifier");
var Relation_1 = require("../Relation");
var Node = /** @class */ (function () {
    function Node(value, parent_node, tree) {
        this.identifier = new Identifier_1.Identifier(tree.provide_node_id(), value);
        this.members = new Array();
        this.children = new Array();
        // Initialize the fragment cache from the given tree.
        this.fc = tree.get_cache();
        if (parent_node !== null) {
            this.parent_node = parent_node.get_identifier();
        }
        else {
            this.parent_node = null;
        }
        this.remainingItems = 0;
        tree.addNode(this);
    }
    Node.prototype.get_identifier = function () {
        return this.identifier;
    };
    Node.prototype.get_node_id = function () {
        return this.identifier.nodeId;
    };
    Node.prototype.get_parent_node_identifier = function () {
        return this.parent_node;
    };
    // This function adds a child node to this node.
    // The parent node is set upon creation
    // This method does not propagate the new information in the node. Needed when replacing an old node for multiple new nodes.
    Node.prototype.add_child_no_propagation = function (childRelation, childNode, value) {
        var relation = new Relation_1.Relation(childRelation, value, childNode.get_identifier());
        this.children.push(relation);
        childNode.set_parent_node(this);
    };
    // Add a child node to this node and propagate the new information.
    Node.prototype.add_child = function (childRelation, node, value) {
        this.add_child_no_propagation(childRelation, node, value);
    };
    Node.prototype.add_child_with_relation = function (relation, node) {
        this.add_child_no_propagation_with_relation(relation, node);
    };
    Node.prototype.add_child_no_propagation_with_relation = function (relation, childNode) {
        this.children.push(relation);
        childNode.set_parent_node(this);
    };
    // Return the total amount of children under this node.
    Node.prototype.get_total_member_count = function () {
        return this.remainingItems;
    };
    Node.prototype.set_remainingItems = function (count) {
        this.remainingItems = count;
    };
    Node.prototype.fix_total_member_count = function () {
        var newcount = 0;
        for (var _i = 0, _a = this.get_children_objects(); _i < _a.length; _i++) {
            var childNode = _a[_i];
            newcount += childNode.get_total_member_count();
        }
        newcount += this.get_members().length;
        this.set_remainingItems(newcount);
    };
    Node.prototype.has_child_relations = function () {
        return this.children.length > 0;
    };
    Node.prototype.propagate_children_count = function (increment) {
        this.remainingItems += increment;
        if (this.has_parent_node()) {
            this.get_parent_node().propagate_children_count(increment);
        }
    };
    Node.prototype.getRelations = function () {
        return this.children;
    };
    // Removes a child node from this node
    Node.prototype.remove_child = function (node) {
        var newRelations = new Array();
        for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
            var relation = _a[_i];
            if (!relation.identifier.equals(node.get_identifier())) {
                newRelations.push(relation);
            }
        }
        this.children = newRelations;
    };
    Node.prototype.swapChildren = function (oldChild, relations, newChildren, values) {
        this.remove_child(oldChild);
        for (var i = 0; i < newChildren.length; i++) {
            this.add_child_no_propagation(relations[i], newChildren[i], values[i]);
        }
    };
    Node.prototype.swapChildrenWithRelation = function (oldChild, relations, newChildren) {
        this.remove_child(oldChild);
        for (var i = 0; i < newChildren.length; i++) {
            this.add_child_no_propagation_with_relation(relations[i], newChildren[i]);
        }
    };
    Node.prototype.clear = function () {
        this.members = new Array();
        this.children = new Array();
        this.parent_node = null;
        this.remainingItems = 0;
    };
    Node.prototype.clearChildren = function () {
        this.children = new Array();
    };
    Node.prototype.get_children_identifiers_with_relation = function (childRelation) {
        var returnList = new Array();
        for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
            var relation = _a[_i];
            if (relation.type === childRelation) {
                returnList.push(relation.identifier);
            }
        }
        return returnList;
    };
    Node.prototype.get_children_with_relation = function (childRelation) {
        var _this = this;
        var identifierList = this.get_children_identifiers_with_relation(childRelation);
        if (identifierList === null) {
            return null;
        }
        return identifierList.map(function (identifier) { return _this.fc.get_node(identifier); });
    };
    // Updates the child node.
    // Used when child changes fragment, so the parent needs to update the child fragment id in its children.
    Node.prototype.update_child = function (oldIdentifier, newIdentifier) {
        for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
            var relation = _a[_i];
            if (relation.identifier.equals(oldIdentifier)) {
                relation.identifier = newIdentifier;
            }
        }
    };
    // Returns the objects of all children for iteration purposes.
    Node.prototype.get_children_objects = function () {
        var _this = this;
        var nodeIds = new Set();
        this.children.map(function (relation) { nodeIds.add(relation.identifier.nodeId); });
        return Array.from(nodeIds).map(function (id) { return _this.fc.get_node_by_id(id); });
    };
    Node.prototype.get_child_by_value = function (value) {
        var _this = this;
        var childrenWithValue = new Array();
        this.children.map(function (relation) { if (relation.value === value) {
            childrenWithValue.push(_this.fc.get_node(relation.identifier));
        } });
        if (childrenWithValue.length !== 1) {
            return null;
        }
        return childrenWithValue[0];
    };
    // Set the children of this node
    // Destructive function!
    // Use only when transfering children from existing node to a newly created node
    Node.prototype.set_children = function (new_children) {
        this.children = new_children;
        this.update_children();
    };
    /**
     * Private method
     * Updates all child nodes with the new fragment of the parent node.
     */
    Node.prototype.update_children = function () {
        var children = this.get_children_objects();
        for (var i = 0; i < children.length; i++) {
            children[i].set_parent_node(this);
        }
    };
    // Return sthe children dict
    Node.prototype.get_children = function () {
        return this.children;
    };
    Node.prototype.deleteMembers = function () {
        this.members = new Array();
    };
    /**
     * Sets the parent node.nex
     * @param {Node} node
     */
    Node.prototype.set_parent_node = function (node) {
        if (node === null) {
            this.parent_node = null;
        }
        else {
            this.parent_node = node.get_identifier();
        }
    };
    /**
     * Returns if this node has a parent node.
     * If this is not the case, this is the root node.
     */
    Node.prototype.has_parent_node = function () {
        return this.parent_node != null;
    };
    /**
     * returns the parent node.
     */
    Node.prototype.get_parent_node = function () {
        if (this.parent_node === null) {
            throw new Error("check parent nodes for nulls by using the has_parent_node() call");
        }
        var parent = this.fc.get_node_by_id(this.parent_node.nodeId);
        if (parent === undefined) {
            throw new Error("check parent nodes for nulls by using the has_parent_node() call");
        }
        return parent;
    };
    /**
     * Overwrites the members in this node.
     * @param {Member} members
     */
    Node.prototype.set_members = function (members) {
        this.members = members;
    };
    /**
     * Returns the members contained in this node.
     */
    Node.prototype.get_members = function () {
        return this.members;
    };
    /**
     * Adds the data object to this node. If the node is a leaf node, it ties to propagate the data up the tree.
     * @param {Member} member
     */
    Node.prototype.add_data = function (member) {
        if (member.contents === null) {
            return;
        }
        this.members.push(member);
        this.propagate_children_count(1);
    };
    /**
     * Helper method to transfer node information to a new node.
     * @param {Node} othernode
     */
    Node.prototype.copy_info = function (othernode) {
        this.set_children(othernode.get_children());
        this.set_members(othernode.get_members());
        this.set_remainingItems(othernode.get_total_member_count());
    };
    Node.prototype.get_only_child_with_relation = function (childRelation) {
        var children = this.get_children_with_relation(childRelation);
        if (children === null) {
            return null;
        }
        if (children.length !== 1) {
            throw new Error("Binary tree may only hava a single child per relation");
        }
        return children[0];
    };
    return Node;
}());
exports.Node = Node;
//# sourceMappingURL=Node.js.map