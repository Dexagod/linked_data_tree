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
var PrefixTree = /** @class */ (function (_super) {
    __extends(PrefixTree, _super);
    function PrefixTree() {
        /**
        * Adds the given data to the tree.
        * @param {Member} member
        */
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.count = 0;
        return _this;
    }
    PrefixTree.prototype.addData = function (representation, member) {
        if (this.node_count === 0) {
            this.createFirstNode("", null);
        }
        if (representation == "" || representation == null) {
            return null;
        }
        return this.recursiveAddition(this.get_root_node(), member, representation);
    };
    PrefixTree.prototype.recursiveAddition = function (currentNode, member, searchString, childValue, level) {
        if (childValue === void 0) { childValue = ""; }
        if (level === void 0) { level = 0; }
        if (currentNode.has_child_relations()) {
            if (searchString === childValue) {
                for (var _i = 0, _a = currentNode.get_children_identifiers_with_relation(ChildRelation_1.ChildRelation.EqualThanRelation); _i < _a.length; _i++) {
                    var childIdentifier = _a[_i];
                    if (searchString === childIdentifier.value) {
                        return this.recursiveAddition(this.get_cache().get_node(childIdentifier), member, searchString, childIdentifier.value, level + 1);
                    }
                }
            }
            for (var _b = 0, _c = currentNode.get_children_identifiers_with_relation(ChildRelation_1.ChildRelation.PrefixRelation); _b < _c.length; _b++) {
                var childIdentifier = _c[_b];
                if (searchString.startsWith(childIdentifier.value)) {
                    return this.recursiveAddition(this.get_cache().get_node(childIdentifier), member, searchString, childIdentifier.value, level + 1);
                }
            }
        }
        if (member !== null) {
            currentNode.add_data(member);
            if (this.checkNodeSplit(currentNode)) {
                return this.splitNode(currentNode, childValue, level);
            }
            else {
                return currentNode;
            }
        }
        return currentNode;
    };
    PrefixTree.prototype.splitNode = function (node, childValue, level) {
        if (level > childValue.length) {
            // splitting a node behind an equalsrelation
            var childNode_1 = new Node_1.Node(childValue, null, this);
            var nodeMembers = node.get_members();
            var splitMember = nodeMembers.pop();
            node.members = nodeMembers;
            if (splitMember === undefined) {
                throw new Error("Undefined split member");
            }
            childNode_1.add_data(splitMember);
            node.add_child_no_propagation(ChildRelation_1.ChildRelation.EqualThanRelation, childNode_1, childValue);
            return childNode_1;
        }
        var characterMap = new Map();
        for (var _i = 0, _a = node.get_members(); _i < _a.length; _i++) {
            var member = _a[_i];
            var nextChar = member.get_representation().substring(level, level + 1);
            var charArray = characterMap.get(nextChar);
            if (charArray === undefined) {
                characterMap.set(nextChar, [member]);
            }
            else {
                charArray.push(member);
            }
        }
        var maxCharacter = "";
        var maxcharacterListSize = 0;
        for (var _b = 0, _c = Array.from(characterMap.entries()); _b < _c.length; _b++) {
            var entry = _c[_b];
            if (entry[1].length > maxcharacterListSize) {
                maxcharacterListSize = entry[1].length;
                maxCharacter = entry[0];
            }
        }
        var maxCharMembersList = new Array();
        var currentNodeMembersList = new Array();
        for (var _d = 0, _e = Array.from(characterMap.entries()); _d < _e.length; _d++) {
            var entry = _e[_d];
            if (entry[0] === maxCharacter) {
                maxCharMembersList = entry[1];
            }
            else {
                currentNodeMembersList = currentNodeMembersList.concat(entry[1]);
            }
        }
        var newValue = childValue + maxCharacter;
        var relation = ChildRelation_1.ChildRelation.PrefixRelation;
        if (maxCharacter === "") {
            relation = ChildRelation_1.ChildRelation.EqualThanRelation;
        }
        var childNode = new Node_1.Node(newValue, null, this);
        for (var _f = 0, maxCharMembersList_1 = maxCharMembersList; _f < maxCharMembersList_1.length; _f++) {
            var member = maxCharMembersList_1[_f];
            childNode.add_data(member);
        }
        node.set_members(currentNodeMembersList);
        node.add_child_no_propagation(relation, childNode, newValue);
        if (this.checkNodeSplit(childNode)) {
            this.splitNode(childNode, newValue, level + 1);
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
        var childrenIdentifiersEqual = currentNode.get_children_identifiers_with_relation(ChildRelation_1.ChildRelation.EqualThanRelation);
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
        for (var _c = 0, childrenIdentifiersEqual_1 = childrenIdentifiersEqual; _c < childrenIdentifiersEqual_1.length; _c++) {
            var childIdentifier = childrenIdentifiersEqual_1[_c];
            if (searchString === childIdentifier.value) {
                var child = this.get_cache().get_node(childIdentifier);
                var _d = this._search_data_recursive(child, searchString), resMems = _d[0], resNodes = _d[1];
                resultingMembers = resultingMembers.concat(resMems);
                resultingNodes = resultingNodes.concat(resNodes);
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