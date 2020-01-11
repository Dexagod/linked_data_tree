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
/*
TODO:: FIX TOTAL COUNTS
*/
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
        var interval = { start: null, end: null, startrelation: null, endrelation: null };
        this.nodePath = [];
        return this.recursiveAddition(this.get_root_node(), member, representation, interval);
    };
    BinaryBTree.prototype.isInInterval = function (interval, value, comparisonFunction) {
        if (interval.start !== null) {
            if (interval.startrelation === ChildRelation_1.ChildRelation.GreaterThanRelation) {
                if (!(comparisonFunction(value, interval.start) > 0)) {
                    return false;
                }
            }
            else if (interval.startrelation === ChildRelation_1.ChildRelation.GreaterOrEqualThanRelation) {
                if (!(comparisonFunction(value, interval.start) >= 0)) {
                    return false;
                }
            }
        }
        if (interval.end !== null) {
            if (interval.endrelation === ChildRelation_1.ChildRelation.LesserThanRelation) {
                if (!(comparisonFunction(value, interval.end) < 0)) {
                    return false;
                }
            }
            else if (interval.endrelation === ChildRelation_1.ChildRelation.LesserOrEqualThanRelation) {
                if (!(comparisonFunction(value, interval.end) <= 0)) {
                    return false;
                }
            }
        }
        return true;
    };
    BinaryBTree.prototype.recursiveAddition = function (currentNode, member, value, interval, level) {
        var _this = this;
        if (level === void 0) { level = 0; }
        this.nodePath.push(currentNode);
        if (currentNode.has_child_relations()) {
            var intervalMap = this.getIntervals(currentNode.getRelations());
            var possibleTargetNodes = []; // List[ [id, interval], .. ]
            for (var _i = 0, _a = Array.from(intervalMap.entries()); _i < _a.length; _i++) {
                var entry = _a[_i];
                if (this.isInInterval(entry[1], value, compare)) {
                    possibleTargetNodes.push(entry);
                }
            }
            if (possibleTargetNodes.length > 0) {
                possibleTargetNodes = possibleTargetNodes.sort(function (a, b) { return _this.get_cache().get_node_by_id(a[0]).get_remainingItems() - _this.get_cache().get_node_by_id(b[0]).get_remainingItems(); });
                return this.recursiveAddition(this.get_cache().get_node_by_id(possibleTargetNodes[0][0]), member, value, possibleTargetNodes[0][1], level + 1);
            }
        }
        if (currentNode.has_child_relations()) {
            throw new Error("There is a gap between the nodes where a value fell through.");
        }
        if (member !== null) {
            currentNode.add_data(member);
            if (this.checkNodeSplit(currentNode)) {
                var node = this.splitLeafNode(currentNode, interval, value);
                return node;
            }
        }
        return currentNode;
    };
    BinaryBTree.prototype.getIntervals = function (relationList) {
        var relationMap = new Map();
        for (var _i = 0, relationList_1 = relationList; _i < relationList_1.length; _i++) {
            var relation = relationList_1[_i];
            if (relation.type === ChildRelation_1.ChildRelation.LesserOrEqualThanRelation) {
                this.addToIntervalMap(relationMap, relation.identifier.nodeId, null, relation.value, relation);
            }
            if (relation.type === ChildRelation_1.ChildRelation.LesserThanRelation) {
                this.addToIntervalMap(relationMap, relation.identifier.nodeId, null, relation.value, relation);
            }
            if (relation.type === ChildRelation_1.ChildRelation.GreaterThanRelation) {
                this.addToIntervalMap(relationMap, relation.identifier.nodeId, relation.value, null, relation);
            }
            if (relation.type === ChildRelation_1.ChildRelation.GreaterOrEqualThanRelation) {
                this.addToIntervalMap(relationMap, relation.identifier.nodeId, relation.value, null, relation);
            }
        }
        return relationMap;
    };
    BinaryBTree.prototype.getParentRelations = function (node) {
        var GTrelation = null;
        var LTrelation = null;
        if (!node.has_parent_node()) {
            return { gtrelation: null, ltrelation: null };
        }
        var parent = node.get_parent_node();
        if (parent === null || parent === undefined) {
            return { gtrelation: null, ltrelation: null };
        }
        var relations = parent.getRelationsForChild(node.identifier);
        if (relations.length !== 1 && relations.length !== 2) {
            throw new Error("Incorrect number of relations to child node");
        }
        for (var _i = 0, relations_1 = relations; _i < relations_1.length; _i++) {
            var relation = relations_1[_i];
            if (relation.type === ChildRelation_1.ChildRelation.GreaterThanRelation || relation.type === ChildRelation_1.ChildRelation.GreaterOrEqualThanRelation) {
                GTrelation = relation;
            }
            else {
                LTrelation = relation;
            }
        }
        return { gtrelation: GTrelation, ltrelation: LTrelation };
    };
    BinaryBTree.prototype.splitLeafNode = function (node, interval, value) {
        for (var _i = 0, _a = node.get_members().map(function (e) { return e.get_representation(); }); _i < _a.length; _i++) {
            var element = _a[_i];
            if (interval.start !== null && compare(interval.start, element) > 0) {
                throw new Error("unsanitary node1");
            }
            if (interval.end !== null && compare(interval.end, element) < 0) {
                throw new Error("unsanitary node2");
            }
        }
        var nodeMembers = node.members.sort(this.compareMembers);
        var smallMembers = nodeMembers.slice(0, Math.floor(nodeMembers.length / 2));
        var largeMembers = nodeMembers.slice(Math.floor(nodeMembers.length / 2));
        var splitMember = smallMembers.pop();
        if (splitMember === undefined) {
            throw new Error("could not define split position");
        }
        node.deleteMembers(); // SPLITVALUE is highest value for the LesserThanOrEqual relation
        var parent = null;
        var nodeHasParent = true;
        var parentRelations = this.getParentRelations(node);
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
        /***
         * SETTING THE NEW RELATION VALUES
         */
        if (interval.start !== null) {
            var relationType = interval.startrelation;
            if (relationType === null || relationType === undefined) {
                throw new Error();
            }
            // if (smallMembers.map((e:any) => e.get_representation()).indexOf(interval.start) !== -1){
            //   relationType = ChildRelation.GreaterOrEqualThanRelation
            // }
            // if (parentRelations.gtrelation !== null) { relationType = parentRelations.gtrelation.type }
            relationList.push(this.createRelation(relationType, interval.start, smallMembersNode.get_identifier()));
            newChildrenList.push(smallMembersNode);
        }
        relationList.push(this.createRelation(ChildRelation_1.ChildRelation.LesserOrEqualThanRelation, splitMember.get_representation(), smallMembersNode.get_identifier()));
        newChildrenList.push(smallMembersNode);
        var afterSplitRelation = splitMember.get_representation() === largeMembers[0].get_representation() ?
            ChildRelation_1.ChildRelation.GreaterOrEqualThanRelation : ChildRelation_1.ChildRelation.GreaterThanRelation;
        relationList.push(this.createRelation(afterSplitRelation, splitMember.get_representation(), largeMembersNode.get_identifier()));
        newChildrenList.push(largeMembersNode);
        if (interval.end !== null) {
            var relationType = interval.endrelation;
            if (relationType === null || relationType === undefined) {
                throw new Error();
            }
            // let relationType = ChildRelation.LesserOrEqualThanRelation
            // if (parentRelations.ltrelation !== null) { relationType = parentRelations.ltrelation.type }
            relationList.push(this.createRelation(relationType, interval.end, largeMembersNode.get_identifier()));
            newChildrenList.push(largeMembersNode);
        }
        this.checkRelationsMinMax(parent);
        if (nodeHasParent) {
            parent.swapChildrenWithRelation(node, relationList, newChildrenList);
            parent.add_data_no_propagation(splitMember);
            this.get_cache().delete_node(node); // delete fragment cause we will only accept one node per fragment
        }
        else {
            for (var i = 0; i < relationList.length; i++) {
                node.add_child_no_propagation_with_relation(relationList[i], newChildrenList[i]);
            }
            node.add_data_no_propagation(splitMember);
            this.set_root_node_identifier(node.get_identifier());
        }
        smallMembersNode.fix_total_member_count();
        largeMembersNode.fix_total_member_count();
        parent.fix_total_member_count();
        if (parent.getRelations().length > this.max_fragment_size) {
            this.splitInternalNode(parent, value);
        }
        return largeMembersNode; // THIS CAN BE INCORRECT BUT IT DOESNT MATTER ANYMORE, WAS USED FOR TESTING PURPOSES
    };
    BinaryBTree.prototype.splitInternalNode = function (node, value) {
        // splitting an internal node
        var memberList = node.get_members().sort(this.compareMembers);
        var intervalMap = this.getIntervals(node.getRelations());
        var intervalEntries = Array.from(intervalMap.entries()).sort(this.comparisonFunction);
        var smallChildrenNodeEntries = intervalEntries.slice(0, Math.ceil(intervalEntries.length / 2));
        var largeChildrenNodeEntries = intervalEntries.slice(Math.ceil(intervalEntries.length / 2));
        var splitValueSmall = smallChildrenNodeEntries[smallChildrenNodeEntries.length - 1][1].end;
        var splitValueLarge = largeChildrenNodeEntries[0][1].start;
        var splitRelationLarge = largeChildrenNodeEntries[0][1].startrelation;
        var smallMembers = memberList.slice(0, Math.floor(node.members.length / 2) + 1);
        var largeMembers = memberList.slice(1 + Math.floor(node.members.length / 2));
        var splitMember = smallMembers.pop();
        if (splitMember === undefined) {
            throw new Error("could not define split position");
        }
        if (splitMember.get_representation() !== splitValueSmall) {
            // console.log(memberList.map(e=>e.representation), "\n", splitMember.get_representation(), splitValueSmall, "\n", smallChildrenNodeEntries.map(e=>[e[1].start, e[1].end]), largeChildrenNodeEntries.map(e=>[e[1].start, e[1].end]));
            throw new Error("Split member does not equal split value");
        }
        node.deleteMembers(); // SPLITVALUE is highest value for the LesserThanOrEqual relation
        var parent = null;
        var nodeHasParent = true;
        var parentRelations = this.getParentRelations(node);
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
        smallChildrenNode.set_members(smallMembers);
        largeChildrenNode.set_members(largeMembers);
        for (var _i = 0, _a = [{ entries: smallChildrenNodeEntries, node: smallChildrenNode }, { entries: largeChildrenNodeEntries, node: largeChildrenNode }]; _i < _a.length; _i++) {
            var nodeEntries = _a[_i];
            for (var _b = 0, _c = nodeEntries.entries; _b < _c.length; _b++) {
                var entry = _c[_b];
                var entryIdentifier = new Identifier_1.Identifier(entry[0], null);
                var interval = entry[1];
                if (entryIdentifier === null || entryIdentifier === undefined || entryIdentifier.nodeId === null || entryIdentifier.nodeId === undefined) {
                    throw new Error(" undefined entry identifier ");
                }
                if (interval.start !== null && interval.startrelation !== null) {
                    var smallrelation = new Relation_1.Relation(interval.startrelation, interval.start, entryIdentifier);
                    nodeEntries.node.add_child_with_relation(smallrelation, this.cache.get_node(entryIdentifier));
                }
                if (interval.end !== null && interval.endrelation !== null) {
                    var largerelation = new Relation_1.Relation(interval.endrelation, interval.end, entryIdentifier);
                    nodeEntries.node.add_child_with_relation(largerelation, this.cache.get_node(entryIdentifier));
                }
            }
        }
        if (nodeHasParent) {
            parent = this.swapNodeChildWithNewChildren(parent, node, smallChildrenNode, largeChildrenNode, splitValueSmall, splitValueLarge, splitRelationLarge);
            parent.add_data_no_propagation(splitMember);
            this.get_cache().delete_node(node); // delete fragment cause we will only accept one node per fragment
        }
        else {
            var ltrelation = parentRelations.ltrelation !== null ? parentRelations.ltrelation.type : ChildRelation_1.ChildRelation.LesserOrEqualThanRelation;
            var gtrelation = parentRelations.gtrelation !== null ? parentRelations.gtrelation.type : splitRelationLarge;
            var smallChildRelation = this.createRelation(ltrelation, splitValueSmall, smallChildrenNode.get_identifier());
            var largeChildRelation = this.createRelation(gtrelation, splitValueLarge, largeChildrenNode.get_identifier());
            node.add_child_with_relation(smallChildRelation, smallChildrenNode);
            node.add_child_with_relation(largeChildRelation, largeChildrenNode);
            this.set_root_node_identifier(node.get_identifier());
            node.add_data_no_propagation(splitMember);
        }
        smallChildrenNode.fix_total_member_count();
        largeChildrenNode.fix_total_member_count();
        parent.fix_total_member_count();
        if (parent.getRelations().length > this.max_fragment_size) {
            this.splitInternalNode(parent, value);
        }
        return node;
    };
    BinaryBTree.prototype.swapNodeChildWithNewChildren = function (parent, oldNode, smallChildrenNode, largeChildrenNode, splitValueSmall, splitValueLarge, splitRelationLarge) {
        var childRelations = parent.children;
        var oldNodeLTERelation = null;
        var oldNodeGTRelation = null;
        var newRelations = new Array();
        if (splitValueSmall === null || splitValueSmall === undefined || splitValueLarge === null || splitValueLarge === undefined) {
            throw new Error("Null value split on node swap.");
        }
        for (var _i = 0, childRelations_1 = childRelations; _i < childRelations_1.length; _i++) {
            var relation = childRelations_1[_i];
            if (relation.identifier.nodeId === oldNode.get_node_id()) {
                if (relation.type === ChildRelation_1.ChildRelation.LesserThanRelation || relation.type === ChildRelation_1.ChildRelation.LesserOrEqualThanRelation) {
                    oldNodeLTERelation = relation;
                }
                else if (relation.type === ChildRelation_1.ChildRelation.GreaterThanRelation || relation.type === ChildRelation_1.ChildRelation.GreaterOrEqualThanRelation) {
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
        /****
         * Add relations to new Node, depending on the realtions of the old node
         */
        if (oldNodeGTRelation !== null && oldNodeGTRelation !== undefined) {
            newRelations.push(this.createRelation(oldNodeGTRelation.type, oldNodeGTRelation.value, smallChildrenNode.get_identifier()));
        }
        newRelations.push(this.createRelation(ChildRelation_1.ChildRelation.LesserOrEqualThanRelation, splitValueSmall, smallChildrenNode.get_identifier()));
        // let relationType = splitValueSmall === splitValueLarge? ChildRelation.GreaterOrEqualThanRelation : ChildRelation.GreaterThanRelation
        newRelations.push(this.createRelation(splitRelationLarge, splitValueSmall, largeChildrenNode.get_identifier()));
        // newRelations.push(this.createRelation(relationType, splitValueSmall, largeChildrenNode.get_identifier()))
        if (oldNodeLTERelation !== null && oldNodeLTERelation !== undefined) {
            newRelations.push(this.createRelation(oldNodeLTERelation.type, oldNodeLTERelation.value, largeChildrenNode.get_identifier()));
        }
        parent.children = newRelations;
        return parent;
    };
    BinaryBTree.prototype.addToIntervalMap = function (map, id, start, end, relation) {
        if (!map.has(id)) {
            var interval = { start: null, end: null, startrelation: null, endrelation: null };
            map.set(id, interval);
        }
        var updatedInterval = map.get(id);
        if (updatedInterval === undefined) {
            updatedInterval = { start: null, end: null, startrelation: null, endrelation: null };
        }
        updatedInterval.start = (start !== null && start !== undefined) ? start : updatedInterval.start;
        updatedInterval.end = (end !== null && end !== undefined) ? end : updatedInterval.end;
        updatedInterval.startrelation = (start !== null && start !== undefined) ? relation.type : updatedInterval.startrelation;
        updatedInterval.endrelation = (end !== null && end !== undefined) ? relation.type : updatedInterval.endrelation;
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
    BinaryBTree.prototype.compareMembers = function (a, b) {
        return compare(a.get_representation(), b.get_representation());
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
        if (a[1].end === null) {
            return 1;
        }
        ;
        if (b[1].end === null) {
            return -1;
        }
        ;
        if (a[1].start !== b[1].start) {
            return compare(a[1].start, b[1].start);
        }
        else {
            return compare(a[1].end, b[1].end);
        }
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
                var interval = entry[1];
                if (this.isInInterval(interval, searchValue, compare)) {
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