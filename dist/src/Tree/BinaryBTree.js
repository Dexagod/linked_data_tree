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
var Identifier_1 = require("../Identifier");
var Relation_1 = require("../Relation");
var BinaryBTree = /** @class */ (function (_super) {
    __extends(BinaryBTree, _super);
    function BinaryBTree() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.nodePath = new Array();
        return _this;
    }
    /**
     * Adds the given data to the tree.
     * @param {Member} member
     */
    BinaryBTree.prototype.addData = function (representation, member) {
        if (this.node_count === 0) {
            this.createFirstNode("", null);
        }
        // Check for invalid object.
        // Object must have a representation.
        if (representation == "" || representation == null) {
            return null;
        }
        var interval = { start: null, end: null };
        this.nodePath = [];
        return this.recursiveAddition(this.get_root_node(), member, representation, interval);
    };
    BinaryBTree.prototype.recursiveAddition = function (currentNode, member, value, interval) {
        this.nodePath.push(currentNode);
        if (currentNode.has_child_relations()) {
            var intervalMap = this.getIntervals(currentNode.getRelations());
            for (var _i = 0, _a = Array.from(intervalMap.entries()); _i < _a.length; _i++) {
                var entry = _a[_i];
                var intervalStart = entry[1].start;
                var intervalEnd = entry[1].end;
                if ((intervalStart === null || this.memberNameComparisonFunction(intervalStart, value) < 0) && (intervalEnd === null || this.memberNameComparisonFunction(value, intervalEnd) <= 0)) { // <= for end because it is a lesser than or equal
                    return this.recursiveAddition(this.get_cache().get_node_by_id(entry[0]), member, value, entry[1]);
                }
            }
        }
        if (currentNode.has_child_relations()) {
            throw new Error("There is a gap between the nodes where a value fell through.");
        }
        if (member !== null) {
            currentNode.add_data(member);
            if (this.checkNodeSplit(currentNode)) {
                return this.splitLeafNode(currentNode, interval, value);
            }
        }
        return currentNode;
    };
    BinaryBTree.prototype.getIntervals = function (relationList) {
        var relationMap = new Map();
        for (var _i = 0, relationList_1 = relationList; _i < relationList_1.length; _i++) {
            var relation = relationList_1[_i];
            if (relation.type === ChildRelation_1.ChildRelation.LesserOrEqualThanRelation) {
                this.addToIntervalMap(relationMap, relation.identifier.nodeId, null, relation.value);
            }
            if (relation.type === ChildRelation_1.ChildRelation.GreaterThanRelation) {
                this.addToIntervalMap(relationMap, relation.identifier.nodeId, relation.value, null);
            }
        }
        return relationMap;
    };
    BinaryBTree.prototype.splitLeafNode = function (node, interval, value) {
        for (var _i = 0, _a = node.get_members().map(function (e) { return e.get_representation(); }); _i < _a.length; _i++) {
            var element = _a[_i];
            if (interval.start !== null && compare(interval.start, element) >= 0) {
                throw new Error("unsanitary node1");
            }
            if (interval.end !== null && compare(interval.end, element) < 0) {
                throw new Error("unsanitary node2");
            }
        }
        var membersSet = new Set();
        for (var _b = 0, _c = node.get_members().map(function (e) { return e.get_representation(); }); _b < _c.length; _b++) {
            var member = _c[_b];
            membersSet.add(member);
        }
        if (membersSet.size < 4) {
            // We cannot split this node, because that would give problems to the balancing; We need at least 2 different values left and right
            return node;
        }
        var orderedMemberNames = Array.from(membersSet).sort(this.memberNameComparisonFunction);
        var smallMemberNames = orderedMemberNames.slice(0, Math.ceil(orderedMemberNames.length / 2));
        var largeMemberNames = orderedMemberNames.slice(Math.ceil(orderedMemberNames.length / 2));
        var splitValue = smallMemberNames[smallMemberNames.length - 1];
        var smallMembers = new Array();
        var largeMembers = new Array();
        for (var _d = 0, _e = node.get_members(); _d < _e.length; _d++) {
            var member = _e[_d];
            if (smallMemberNames.indexOf(member.get_representation()) != -1) {
                smallMembers.push(member);
            }
            else if (largeMemberNames.indexOf(member.get_representation()) != -1) {
                largeMembers.push(member);
            }
            else {
                throw new Error('member name not in list');
            }
        }
        node.deleteMembers(); // SPLITVALUE is highest value for the LesserThanOrEqual relation
        var parent = null;
        var nodeHasParent = true;
        if (node.has_parent_node()) {
            parent = node.get_parent_node();
        }
        else {
            nodeHasParent = false;
            node.clear();
            parent = node;
        }
        var smallMembersNode = new Node_1.Node(null, parent, this);
        var largeMembersNode = new Node_1.Node(null, parent, this);
        smallMembersNode.set_members(smallMembers);
        largeMembersNode.set_members(largeMembers);
        var relationList = new Array();
        var newChildrenList = new Array();
        if (interval.start !== null) {
            relationList.push(this.createRelation(ChildRelation_1.ChildRelation.GreaterThanRelation, interval.start, smallMembersNode.get_identifier()));
            newChildrenList.push(smallMembersNode);
        }
        relationList.push(this.createRelation(ChildRelation_1.ChildRelation.LesserOrEqualThanRelation, splitValue, smallMembersNode.get_identifier()));
        newChildrenList.push(smallMembersNode);
        relationList.push(this.createRelation(ChildRelation_1.ChildRelation.GreaterThanRelation, splitValue, largeMembersNode.get_identifier()));
        newChildrenList.push(largeMembersNode);
        if (interval.end !== null) {
            relationList.push(this.createRelation(ChildRelation_1.ChildRelation.LesserOrEqualThanRelation, interval.end, largeMembersNode.get_identifier()));
            newChildrenList.push(largeMembersNode);
        }
        smallMembersNode.fix_total_member_count();
        largeMembersNode.fix_total_member_count();
        this.checkRelationsMinMax(parent);
        if (nodeHasParent) {
            parent.swapChildrenWithRelation(node, relationList, newChildrenList);
            parent.fix_total_member_count();
            this.get_cache().delete_node(node); // delete fragment cause we will only accept one node per fragment
        }
        else {
            for (var i = 0; i < relationList.length; i++) {
                node.add_child_no_propagation_with_relation(relationList[i], newChildrenList[i]);
            }
            this.set_root_node_identifier(node.get_identifier());
            node.fix_total_member_count();
        }
        if (parent.getRelations().length > this.max_fragment_size) {
            this.splitInternalNode(parent, value);
        }
        if (value <= splitValue) {
            return smallMembersNode;
        }
        else {
            return largeMembersNode;
        }
    };
    BinaryBTree.prototype.splitInternalNode = function (node, value) {
        // splitting an internal node
        var _a = this.checkRelationsMinMax(node), start = _a[0], end = _a[1];
        var intervalMap = this.getIntervals(node.getRelations());
        var smallChildrenNodeEntries = Array.from(intervalMap.entries()).sort(this.comparisonFunction);
        var largeChildrenNodeEntries = smallChildrenNodeEntries.splice(Math.ceil(smallChildrenNodeEntries.length / 2));
        var splitValue = smallChildrenNodeEntries[smallChildrenNodeEntries.length - 1][1].end;
        var parent = null;
        var nodeHasParent = true;
        if (node.has_parent_node()) {
            parent = node.get_parent_node();
        }
        else {
            nodeHasParent = false;
            node.clear();
            parent = node;
        }
        var smallChildrenNode = new Node_1.Node(null, parent, this);
        var largeChildrenNode = new Node_1.Node(null, parent, this);
        for (var _i = 0, smallChildrenNodeEntries_1 = smallChildrenNodeEntries; _i < smallChildrenNodeEntries_1.length; _i++) {
            var entry = smallChildrenNodeEntries_1[_i];
            var entryIdentifier = new Identifier_1.Identifier(entry[0], null);
            var entryStart = entry[1].start;
            var entryEnd = entry[1].end;
            if (entryIdentifier === null || entryIdentifier === undefined || entryIdentifier.nodeId === null || entryIdentifier.nodeId === undefined) {
                throw new Error(" undefined entry identifier ");
            }
            if (entryStart !== null) {
                var smallChildGTRelation = new Relation_1.Relation(ChildRelation_1.ChildRelation.GreaterThanRelation, entryStart, entryIdentifier);
                smallChildrenNode.add_child_with_relation(smallChildGTRelation, this.cache.get_node(entryIdentifier));
            }
            if (entryEnd !== null) {
                var smallChildLTERelation = new Relation_1.Relation(ChildRelation_1.ChildRelation.LesserOrEqualThanRelation, entryEnd, entryIdentifier);
                smallChildrenNode.add_child_with_relation(smallChildLTERelation, this.cache.get_node(entryIdentifier));
            }
            else {
                throw new Error("Impossible internal tree state");
            }
        }
        for (var _b = 0, largeChildrenNodeEntries_1 = largeChildrenNodeEntries; _b < largeChildrenNodeEntries_1.length; _b++) {
            var entry = largeChildrenNodeEntries_1[_b];
            var entryIdentifier = new Identifier_1.Identifier(entry[0], null);
            var entryStart = entry[1].start;
            var entryEnd = entry[1].end;
            if (entryIdentifier === null || entryIdentifier === undefined || entryIdentifier.nodeId === null || entryIdentifier.nodeId === undefined) {
                throw new Error(" undefined entry identifier ");
            }
            if (entryStart !== null) {
                var largeChildGTRelation = new Relation_1.Relation(ChildRelation_1.ChildRelation.GreaterThanRelation, entryStart, entryIdentifier);
                largeChildrenNode.add_child_with_relation(largeChildGTRelation, this.cache.get_node(entryIdentifier));
            }
            else {
                throw new Error("this should not happen 4");
            }
            if (entryEnd !== null) {
                var largeChildLTERelation = new Relation_1.Relation(ChildRelation_1.ChildRelation.LesserOrEqualThanRelation, entryEnd, entryIdentifier);
                largeChildrenNode.add_child_with_relation(largeChildLTERelation, this.cache.get_node(entryIdentifier));
            }
        }
        smallChildrenNode.fix_total_member_count();
        largeChildrenNode.fix_total_member_count();
        if (nodeHasParent) {
            parent = this.swapNodeChildWithNewChildren(parent, node, smallChildrenNode, largeChildrenNode, splitValue);
            parent.fix_total_member_count();
            this.get_cache().delete_node(node); // delete fragment cause we will only accept one node per fragment
        }
        else {
            var smallChildRelation = this.createRelation(ChildRelation_1.ChildRelation.LesserOrEqualThanRelation, splitValue, smallChildrenNode.get_identifier());
            var largeChildRelation = this.createRelation(ChildRelation_1.ChildRelation.GreaterThanRelation, splitValue, largeChildrenNode.get_identifier());
            node.add_child_with_relation(smallChildRelation, smallChildrenNode);
            node.add_child_with_relation(largeChildRelation, largeChildrenNode);
            this.set_root_node_identifier(node.get_identifier());
            node.fix_total_member_count();
        }
        if (parent.getRelations().length > this.max_fragment_size) {
            this.splitInternalNode(parent, value);
        }
        var _c = this.checkRelationsMinMax(smallChildrenNode), smallstart = _c[0], smallend = _c[1];
        var _d = this.checkRelationsMinMax(largeChildrenNode), largestart = _d[0], largeend = _d[1];
        if (smallend !== largestart) {
            throw new Error("SPLIT NDOE WRONG MIDDLE");
        }
        if (smallstart !== start || largeend !== end) {
            throw new Error("SPLIT NODE WRONG EDGES");
        }
        this.checkRelationsMinMax(parent);
        return node;
    };
    BinaryBTree.prototype.swapNodeChildWithNewChildren = function (parent, oldNode, smallChildrenNode, largeChildrenNode, splitValue) {
        var childRelations = parent.children;
        var oldNodeLTERelation = null;
        var oldNodeGTRelation = null;
        var newRelations = new Array();
        if (splitValue === null || splitValue === undefined) {
            throw new Error("Null value split on node swap.");
        }
        for (var _i = 0, childRelations_1 = childRelations; _i < childRelations_1.length; _i++) {
            var relation = childRelations_1[_i];
            if (relation.identifier.nodeId === oldNode.get_node_id()) {
                if (relation.type === ChildRelation_1.ChildRelation.LesserOrEqualThanRelation) {
                    oldNodeLTERelation = relation;
                }
                else if (relation.type === ChildRelation_1.ChildRelation.GreaterThanRelation) {
                    oldNodeGTRelation = relation;
                }
                else {
                    newRelations.push(relation);
                }
            }
            else {
                newRelations.push(relation);
            }
        }
        if (oldNodeGTRelation !== null && oldNodeGTRelation !== undefined && (oldNodeGTRelation.value === null || oldNodeGTRelation.value === undefined)) {
            throw new Error("Impossible relation value 1");
        }
        if (oldNodeLTERelation !== null && oldNodeLTERelation !== undefined && (oldNodeLTERelation.value === null || oldNodeLTERelation.value === undefined)) {
            throw new Error("Impossible relation value 1");
        }
        if (oldNodeGTRelation !== null && oldNodeGTRelation !== undefined) {
            newRelations.push(this.createRelation(ChildRelation_1.ChildRelation.GreaterThanRelation, oldNodeGTRelation.value, smallChildrenNode.get_identifier()));
        }
        newRelations.push(this.createRelation(ChildRelation_1.ChildRelation.LesserOrEqualThanRelation, splitValue, smallChildrenNode.get_identifier()));
        newRelations.push(this.createRelation(ChildRelation_1.ChildRelation.GreaterThanRelation, splitValue, largeChildrenNode.get_identifier()));
        if (oldNodeLTERelation !== null && oldNodeLTERelation !== undefined) {
            newRelations.push(this.createRelation(ChildRelation_1.ChildRelation.LesserOrEqualThanRelation, oldNodeLTERelation.value, largeChildrenNode.get_identifier()));
        }
        parent.children = newRelations;
        return parent;
    };
    BinaryBTree.prototype.addToIntervalMap = function (map, id, start, end) {
        if (!map.has(id)) {
            var interval = { start: null, end: null };
            map.set(id, interval);
        }
        var updatedInterval = map.get(id);
        if (updatedInterval === undefined) {
            updatedInterval = { start: null, end: null };
        }
        updatedInterval.start = (start !== null && start !== undefined) ? start : updatedInterval.start;
        updatedInterval.end = (end !== null && end !== undefined) ? end : updatedInterval.end;
        map.set(id, updatedInterval);
    };
    BinaryBTree.prototype.createRelation = function (childRelation, value, identifier) {
        if (value === null || value === undefined || value === NaN) {
            throw new Error("Zero value on Relation creation");
        }
        if (identifier === null || identifier === undefined || identifier.nodeId === null || identifier.nodeId === undefined) {
            throw new Error("Zero identifier on Relation creation");
        }
        return new Relation_1.Relation(childRelation, value, identifier);
    };
    BinaryBTree.prototype.checkRelationsMinMax = function (node) {
        var intervals = this.getIntervals(node.getRelations());
        if (intervals.size === 0) {
            return [];
        }
        var sortedIntervals = Array.from(intervals.entries()).sort(this.comparisonFunction);
        for (var i = 0; i < (sortedIntervals.length - 1); i++) {
            if (sortedIntervals[i] === undefined || sortedIntervals[i + 1] === undefined || sortedIntervals[i][1].end !== sortedIntervals[i + 1][1].start) {
                throw new Error("node relations are not filling the whole namespace");
            }
        }
        return ([sortedIntervals[0][1].start, sortedIntervals[sortedIntervals.length - 1][1].end]);
    };
    BinaryBTree.prototype.comparisonFunction = function (a, b) {
        if (a[1].start === null) {
            return -1;
        }
        ;
        if (b[1].start === null) {
            return 1;
        }
        ;
        if (typeof a[1].start === "string") {
            return compare(a[1].start, b[1].start);
        }
        return a[1].start - b[1].start;
    };
    BinaryBTree.prototype.memberNameComparisonFunction = function (a, b) {
        if (typeof a === "string") {
            return compare(a, b);
        }
        return a - b;
    };
    /**
    * The given dataobject is searched in the tree.
    * For testing and debugging purposes.
    * @param {DataObject} searched_member
    */
    BinaryBTree.prototype.searchData = function (value) {
        return this._search_data_recursive(this.get_root_node(), value)[0];
    };
    BinaryBTree.prototype.searchNode = function (value) {
        var nodes = this._search_data_recursive(this.get_root_node(), value)[1];
        var returnNodes = new Array();
        var addedNodes = new Set();
        for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
            var node = nodes_1[_i];
            for (var _a = 0, _b = node.get_members(); _a < _b.length; _a++) {
                var member = _b[_a];
                if (member.get_representation() === value) {
                    if (!addedNodes.has(node.get_node_id())) {
                        returnNodes.push(node);
                        addedNodes.add(node.get_node_id());
                    }
                    break;
                }
            }
        }
        return returnNodes;
    };
    BinaryBTree.prototype._search_data_recursive = function (currentNode, searchValue) {
        var resultingMembers = new Array();
        var resultingNodes = new Array();
        for (var _i = 0, _a = currentNode.get_members(); _i < _a.length; _i++) {
            var member = _a[_i];
            if (member.get_representation() === searchValue) {
                resultingMembers.push(member);
                resultingNodes.push(currentNode);
            }
        }
        if (currentNode.has_child_relations()) {
            var intervalMap = this.getIntervals(currentNode.getRelations());
            for (var _b = 0, _c = Array.from(intervalMap.entries()); _b < _c.length; _b++) {
                var entry = _c[_b];
                var intervalStart = entry[1].start;
                var intervalEnd = entry[1].end;
                if ((intervalStart === null || this.memberNameComparisonFunction(intervalStart, searchValue) < 0) && (intervalEnd === null || this.memberNameComparisonFunction(searchValue, intervalEnd) <= 0)) { // <= for end because it is a lesser than or equal
                    var _d = this._search_data_recursive(this.get_cache().get_node_by_id(entry[0]), searchValue), resMems = _d[0], resNodes = _d[1];
                    resultingMembers = resultingMembers.concat(resMems);
                    resultingNodes = resultingNodes.concat(resNodes);
                }
            }
        }
        return [resultingMembers, resultingNodes];
    };
    return BinaryBTree;
}(Tree_1.Tree));
exports.BinaryBTree = BinaryBTree;
function compare(a, b) {
    if (typeof a === 'string' && typeof b === 'string') {
        return a.localeCompare(b);
    }
    else {
        return a - b;
    }
}
//# sourceMappingURL=BinaryBTree.js.map