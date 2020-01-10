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
        if (representation == "" || representation == null) {
            return null;
        }
        return this.recursiveAddition(this.get_root_node(), member, representation);
    };
    PrefixTree.prototype.recursiveAddition = function (currentNode, member, searchString, childValue) {
        if (childValue === void 0) { childValue = ""; }
        if (currentNode.has_child_relations()) {
            var childRelationIdentifiers = currentNode.get_children_identifiers_with_relation(ChildRelation_1.ChildRelation.PrefixRelation);
            if (childRelationIdentifiers !== null) {
                for (var _i = 0, _a = childRelationIdentifiers.sort(function (a, b) { return b.value.length - a.value.length; }); _i < _a.length; _i++) { //START SEARCHING WITH LONGEST MATCH
                    var childIdentifier = _a[_i];
                    if (searchString.startsWith(childIdentifier.value)) {
                        return this.recursiveAddition(this.get_cache().get_node(childIdentifier), member, searchString, childIdentifier.value);
                    }
                }
            }
        }
        if (member !== null) {
            currentNode.add_data(member);
            if (this.checkNodeSplit(currentNode)) {
                return this.splitNode(currentNode, member.get_representation(), childValue);
            }
            else {
                return currentNode;
            }
        }
        return currentNode;
    };
    PrefixTree.prototype.splitNode = function (node, addedString, childValue) {
        var newNodeMembers = new Array();
        var potentialSplitMembers = new Array();
        for (var _i = 0, _a = node.get_members(); _i < _a.length; _i++) {
            var member = _a[_i];
            if (member.representation === childValue) {
                newNodeMembers.push(member);
            }
            else {
                potentialSplitMembers.push(member);
            }
        }
        var childNode = null;
        if (potentialSplitMembers.length < Math.ceil(this.max_fragment_size / 100) || potentialSplitMembers.length < 5) {
            var nodeMembers = node.get_members();
            var memberString = nodeMembers[0].representation;
            childNode = new Node_1.Node(memberString, node, this);
            var parentNodeList = potentialSplitMembers;
            var childNodeList = [];
            for (var _b = 0, newNodeMembers_1 = newNodeMembers; _b < newNodeMembers_1.length; _b++) {
                var member = newNodeMembers_1[_b];
                if (parentNodeList.length < Math.floor(this.max_fragment_size / 2)) {
                    parentNodeList.push(member);
                }
                else {
                    childNodeList.push(member);
                }
            }
            node.set_members(parentNodeList);
            childNode.set_members(childNodeList);
            node.add_child(ChildRelation_1.ChildRelation.PrefixRelation, childNode, memberString);
            childNode.fix_total_member_count();
            node.fix_total_member_count();
            return childNode;
        }
        var firstLettersArray = potentialSplitMembers.map(function (e) { return e.get_representation().substring(childValue.length, childValue.length + 1); });
        var frequencyMap = firstLettersArray.reduce(function (acc, e) { return acc.set(e, (acc.get(e) || 0) + 1); }, new Map());
        // console.log(currentNodePathString, currentNodePathString.length, frequencyMap, nodeMembers.map(e => [e.get_representation().substring(currentNodePathString.length, currentNodePathString.length + 1), this.getNormalizedString(e.get_representation()), e.get_representation()]))
        var maxFreq = 0;
        var maxChar = null;
        for (var _c = 0, _d = Array.from(frequencyMap.entries()); _c < _d.length; _c++) {
            var item = _d[_c];
            if (item[1] > maxFreq) {
                maxChar = item[0];
                maxFreq = item[1];
            }
        }
        if (maxChar === null) {
            throw new Error("Something went wrong internally while building the tree. Could not split an internal node on overflow.");
        }
        var splitMembers = new Array();
        for (var _e = 0, potentialSplitMembers_1 = potentialSplitMembers; _e < potentialSplitMembers_1.length; _e++) {
            var member = potentialSplitMembers_1[_e];
            if (member.representation.substring(childValue.length, childValue.length + 1) === maxChar) {
                splitMembers.push(member);
            }
            else {
                newNodeMembers.push(member);
            }
        }
        if (splitMembers.length !== 0) {
            var newNodeValue = childValue + maxChar;
            childNode = new Node_1.Node(newNodeValue, node, this);
            node.set_members(newNodeMembers);
            childNode.set_members(splitMembers);
            node.add_child(ChildRelation_1.ChildRelation.PrefixRelation, childNode, newNodeValue);
            childNode.fix_total_member_count();
            node.fix_total_member_count();
        }
        if (this.checkNodeSplit(node)) {
            // THERE ARE MORE THAN fragmensize AMOUNT OF ITEMS WITH THE SAME NAME
            var nodeMembers = node.get_members();
            var memberString = nodeMembers[0].representation;
            childNode = new Node_1.Node(memberString, node, this);
            var newMembers = nodeMembers.slice(0, Math.floor(nodeMembers.length / 2));
            var splitMembers_1 = nodeMembers.slice(Math.floor(nodeMembers.length / 2));
            node.set_members(newMembers);
            childNode.set_members(splitMembers_1);
            node.add_child(ChildRelation_1.ChildRelation.PrefixRelation, childNode, memberString);
            childNode.fix_total_member_count();
            node.fix_total_member_count();
        }
        if (node.get_members().length > this.max_fragment_size) {
            throw new Error();
        }
        if (childNode !== null && addedString.startsWith(maxChar)) {
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
        return this._search_data_recursive(this.get_root_node(), value)[0];
    };
    PrefixTree.prototype.searchNode = function (value) {
        var nodes = this._search_data_recursive(this.get_root_node(), value)[1];
        var returnNodes = Array();
        for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
            var node = nodes_1[_i];
            for (var _a = 0, _b = node.get_members(); _a < _b.length; _a++) {
                var member = _b[_a];
                if (member.get_representation() === value) {
                    returnNodes.push(node);
                    break;
                }
            }
        }
        return returnNodes;
    };
    PrefixTree.prototype._search_data_recursive = function (currentNode, searchString) {
        var resultingMembers = new Array();
        var resultingNodes = new Array();
        var childrenIdentifiers = currentNode.get_children_identifiers_with_relation(ChildRelation_1.ChildRelation.PrefixRelation);
        if (childrenIdentifiers !== null && childrenIdentifiers.length > 0) {
            for (var _i = 0, childrenIdentifiers_1 = childrenIdentifiers; _i < childrenIdentifiers_1.length; _i++) {
                var childIdentifier = childrenIdentifiers_1[_i];
                if (searchString.startsWith(childIdentifier.value)) {
                    var child = this.get_cache().get_node(childIdentifier);
                    var _a = this._search_data_recursive(child, searchString), resMems = _a[0], resNodes = _a[1];
                    resultingMembers = resultingMembers.concat(resMems);
                    resultingNodes = resultingNodes.concat(resNodes);
                }
                else if (childIdentifier.value.startsWith(searchString)) {
                    var child = this.get_cache().get_node(childIdentifier);
                    var _b = this._search_data_recursive(child, ""), resMems = _b[0], resNodes = _b[1];
                    resultingMembers = resultingMembers.concat(resMems);
                    resultingNodes = resultingNodes.concat(resNodes);
                }
            }
        }
        resultingMembers = resultingMembers.concat(currentNode.get_members());
        resultingNodes.push(currentNode);
        return [resultingMembers, resultingNodes];
    };
    return PrefixTree;
}(Tree_1.Tree));
exports.PrefixTree = PrefixTree;
//# sourceMappingURL=PrefixTree.js.map