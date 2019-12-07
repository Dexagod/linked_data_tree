"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Tree_1 = require("./Tree");
var Node_1 = require("../Node/Node");
var ChildRelation_1 = require("../Relations/ChildRelation");
// const normalizeString = require('stringnormalizer');
var PrefixTree = /** @class */ (function (_super) {
    __extends(PrefixTree, _super);
    function PrefixTree() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
    * Adds the given data to the tree.
    * @param {Member} member
    */
    PrefixTree.prototype.addData = function (representation, member) {
        if (this.node_count === 0) {
            this.createFirstNode("", null);
        }
        var repr = representation;
        // Check for invalid object.
        // Object must have a representation.
        if (repr == "" || repr == null) {
            return null;
        }
        return this.recursiveAddition(this.get_root_node(), member, representation);
    };
    PrefixTree.prototype.recursiveAddition = function (currentNode, member, searchString, childValue) {
        if (childValue === void 0) { childValue = ""; }
        if (currentNode.has_child_relations()) {
            var childRelationIdentifiers = currentNode.get_children_identifiers_with_relation(ChildRelation_1.ChildRelation.PrefixRelation);
            if (childRelationIdentifiers !== null) {
                for (var _i = 0, childRelationIdentifiers_1 = childRelationIdentifiers; _i < childRelationIdentifiers_1.length; _i++) {
                    var childIdentifier = childRelationIdentifiers_1[_i];
                    if (searchString.startsWith(childIdentifier.value)) {
                        return this.recursiveAddition(this.get_cache().get_node(childIdentifier), member, searchString, childIdentifier.value);
                    }
                }
            }
        }
        if (member !== null) {
            currentNode.add_data(member);
            if (currentNode.get_members().length <= this.max_fragment_size) {
                return currentNode;
            }
            else {
                return this.splitNode(currentNode, member.get_representation(), childValue);
            }
        }
        return currentNode;
    };
    PrefixTree.prototype.splitNode = function (node, addedString, childValue) {
        var nodeMembers = node.get_members();
        var firstLettersArray = nodeMembers.map(function (e) { return e.get_representation().substring(childValue.length, childValue.length + 1); });
        var frequencyMap = firstLettersArray.reduce(function (acc, e) { return acc.set(e, (acc.get(e) || 0) + 1); }, new Map());
        // console.log(currentNodePathString, currentNodePathString.length, frequencyMap, nodeMembers.map(e => [e.get_representation().substring(currentNodePathString.length, currentNodePathString.length + 1), this.getNormalizedString(e.get_representation()), e.get_representation()]))
        var maxFreq = 0;
        var maxChar = null;
        for (var _i = 0, _a = Array.from(frequencyMap.entries()); _i < _a.length; _i++) {
            var item = _a[_i];
            if (item[1] > maxFreq) {
                maxChar = item[0];
                maxFreq = item[1];
            }
        }
        if (maxChar === null) {
            throw new Error("Something went wrong internally while building the tree. Could not split an internal node on overflow.");
        }
        var newNodeMembers = new Array();
        var splitMembers = new Array();
        for (var _b = 0, nodeMembers_1 = nodeMembers; _b < nodeMembers_1.length; _b++) {
            var member = nodeMembers_1[_b];
            if (member.representation.substring(childValue.length, childValue.length + 1) === maxChar) {
                splitMembers.push(member);
            }
            else {
                newNodeMembers.push(member);
            }
        }
        node.set_members(newNodeMembers);
        var newNodeValue = childValue + maxChar;
        var childNode = new Node_1.Node(newNodeValue, node, this);
        childNode.set_members(splitMembers);
        node.add_child(ChildRelation_1.ChildRelation.PrefixRelation, childNode, newNodeValue);
        childNode.fix_total_member_count();
        node.fix_total_member_count();
        if (addedString.startsWith(maxChar)) {
            return childNode;
        }
        return node;
    };
    /**
     * The given dataobject is searched in the tree.
     * For testing and debugging purposes.
     * @param {DataObject} searched_member
     */
    PrefixTree.prototype.searchData = function (value) {
        return this._search_data_recursive(this.get_root_node(), value);
    };
    PrefixTree.prototype._search_data_recursive = function (currentNode, searchString) {
        var resultingMembers = new Array();
        var childrenIdentifiers = currentNode.get_children_identifiers_with_relation(ChildRelation_1.ChildRelation.PrefixRelation);
        if (childrenIdentifiers !== null) {
            for (var _i = 0, childrenIdentifiers_1 = childrenIdentifiers; _i < childrenIdentifiers_1.length; _i++) {
                var childIdentifier = childrenIdentifiers_1[_i];
                if (searchString.startsWith(childIdentifier.value)) {
                    var child = this.get_cache().get_node(childIdentifier);
                    resultingMembers = resultingMembers.concat(this._search_data_recursive(child, searchString));
                }
                else if (childIdentifier.value.startsWith(searchString)) {
                    var child = this.get_cache().get_node(childIdentifier);
                    resultingMembers = resultingMembers.concat(this._search_data_recursive(child, ""));
                }
            }
        }
        resultingMembers = resultingMembers.concat(currentNode.get_members());
        return resultingMembers;
    };
    return PrefixTree;
}(Tree_1.Tree));
exports.PrefixTree = PrefixTree;
//# sourceMappingURL=PrefixTree.js.map