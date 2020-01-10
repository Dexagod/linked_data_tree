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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Tree_1 = require("./Tree");
var Node_1 = require("../Node/Node");
var ChildRelation_1 = require("../Relations/ChildRelation");
var terraformer = __importStar(require("terraformer"));
var Identifier_1 = require("../Identifier");
var RTree = /** @class */ (function (_super) {
    __extends(RTree, _super);
    function RTree() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RTree.prototype.addData = function (representation, member) {
        if (this.node_count === 0) {
            return this.createFirstNode(representation, member);
        }
        return this.recursiveAddition(this.get_root_node(), member);
    };
    RTree.prototype.recursiveAddition = function (currentNode, member) {
        if (currentNode.has_child_relations()) {
            var childrenIdentifiers = currentNode.get_children_identifiers_with_relation(ChildRelation_1.ChildRelation.GeospatiallyContainsRelation);
            if (childrenIdentifiers !== null) { // Node has childRelations of type GeospaciallyContainsRelation
                var containingChild = this.findContainingChild(childrenIdentifiers, member.get_representation());
                // Geen child node die de nieuwe data containt
                if (containingChild !== null) {
                    return this.recursiveAddition(containingChild, member);
                }
                var foundNode = this.findClosestBoundingBoxIndex(currentNode, member.get_representation());
                if (foundNode.get_node_id() === currentNode.get_node_id()) {
                    return this.addMemberToNode(currentNode, member);
                }
                else {
                    return this.recursiveAddition(foundNode, member);
                }
            }
        }
        // Node is a leaf node (does not have any children of type GeospaciallyContainsRelation)
        return this.addMemberToNode(currentNode, member);
    };
    RTree.prototype.addMemberToNode = function (currentNode, member) {
        if (!this.isContained(member.get_representation(), currentNode.get_identifier().value)) {
            var currentNodeBBox = currentNode.get_identifier().value.bbox();
            var dataBBox = member.get_representation().bbox();
            if (currentNodeBBox === undefined || dataBBox === undefined) {
                throw new Error("bbox was undefined");
            }
            currentNode.identifier.value = this.bboxToGeoJSON(this.expandBoundingBox(currentNodeBBox, dataBBox));
        }
        currentNode.add_data(member);
        if (this.checkNodeSplit(currentNode)) {
            return this.splitNode(currentNode, member);
        }
        else {
            return currentNode;
        }
    };
    RTree.prototype.searchData = function (value) {
        return this._search_data_recursive(this.get_root_node(), value)[0];
    };
    RTree.prototype.searchNode = function (value) {
        var nodes = this._search_data_recursive(this.get_root_node(), value)[1];
        var returnNodes = Array();
        for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
            var node = nodes_1[_i];
            for (var _a = 0, _b = node.get_members(); _a < _b.length; _a++) {
                var member = _b[_a];
                if (this.isContained(member.get_representation(), value)) {
                    returnNodes.push(node);
                    break;
                }
            }
        }
        return returnNodes;
    };
    RTree.prototype._search_data_recursive = function (currentNode, area) {
        var _this = this;
        var childrenIdentifiers = currentNode.get_children_identifiers_with_relation(ChildRelation_1.ChildRelation.GeospatiallyContainsRelation);
        var resultingMembers = new Array();
        var resultingNodes = new Array();
        if (childrenIdentifiers !== null) {
            var containingChildren = this.findContainingOrOverlappingChildren(childrenIdentifiers, area);
            if (containingChildren.length === 0) {
                resultingNodes.concat(currentNode);
                return [[], resultingNodes];
            }
            else {
                containingChildren.forEach(function (child) {
                    var _a = _this._search_data_recursive(child, area), resMems = _a[0], resNodes = _a[1];
                    resultingMembers = resultingMembers.concat(resMems);
                    resultingNodes = resultingNodes.concat(resNodes);
                });
            }
        }
        currentNode.members.forEach(function (tdo) {
            if (_this.isContained(tdo.get_representation(), area)) {
                resultingMembers.push(tdo);
            }
        });
        resultingNodes.push(currentNode);
        return [resultingMembers, resultingNodes];
    };
    RTree.prototype.findClosestBoundingBoxIndex = function (currentNode, dataWKTstring) {
        var childrenIdentifiers = currentNode.get_children_identifiers_with_relation(ChildRelation_1.ChildRelation.GeospatiallyContainsRelation);
        if (childrenIdentifiers === null) {
            throw new Error("impossible");
        }
        var boundingBoxList = childrenIdentifiers.map(function (identifier) { return identifier.value; });
        var smallestBoundingBoxIndex = 0;
        var smallestBoundingBox = null;
        var smallestSizeDifference = Infinity;
        var dataBoundingBox = dataWKTstring.bbox();
        if (dataBoundingBox === undefined) {
            throw new Error("undefined bounding box for the given data");
        }
        for (var i = 0; i < boundingBoxList.length; i++) {
            var childParsed = boundingBoxList[i];
            var childBoundingBox = childParsed.bbox();
            if (childBoundingBox === undefined) {
                throw new Error("undefined bounding box for the given child node value");
            }
            var expandedBoundingBox_1 = this.expandBoundingBox(dataBoundingBox, childBoundingBox);
            var expandedBboxSize = this.getBBoxSize(expandedBoundingBox_1);
            var sizeDifference = expandedBboxSize - this.getBBoxSize(childBoundingBox);
            if (sizeDifference < smallestSizeDifference) {
                smallestBoundingBox = expandedBoundingBox_1;
                smallestSizeDifference = sizeDifference;
                smallestBoundingBoxIndex = i;
            }
        }
        var currentNodeBBox = currentNode.get_identifier().value.bbox();
        var expandedBoundingBox = this.expandBoundingBox(dataBoundingBox, currentNodeBBox);
        if (smallestBoundingBox === null) {
            throw new Error("couldnt split node");
        }
        else {
            var oldIdentifier = childrenIdentifiers[smallestBoundingBoxIndex];
            var newValue = this.bboxToGeoJSON(smallestBoundingBox);
            var newIdentifier = new Identifier_1.Identifier(oldIdentifier.nodeId, newValue);
            currentNode.update_child(oldIdentifier, newIdentifier);
            var node = this.get_cache().get_node(oldIdentifier);
            node.identifier.value = newValue;
            return node;
        }
    };
    RTree.prototype.splitNode = function (node, addedMember) {
        var childrenIdentifiers = node.get_children_identifiers_with_relation(ChildRelation_1.ChildRelation.GeospatiallyContainsRelation);
        if (childrenIdentifiers === null || childrenIdentifiers.length === 0) {
            // We are splitting a leaf node, and have to devide the Members
            return this.splitLeafNode(node, addedMember);
        }
        else {
            // We are splitting an internal node, and have to devide the children
            return this.splitInnerNode(node);
        }
    };
    RTree.prototype.splitLeafNode = function (node, addedMember) {
        var _this = this;
        var parent = null;
        var splitNode1 = null;
        var splitNode2 = null;
        var entryBboxes = node.get_members().map(function (e) { return e.get_representation().bbox(); });
        var splitAxis = this.chooseAxis(entryBboxes, node.get_identifier().value.bbox()); // 0 == split on X axis, 1 == split on Y axis
        if (splitAxis !== 0 && splitAxis !== 1) {
            throw new Error("invalid axis passed to the distribute function");
        }
        var items = node.get_members();
        items.sort(function (a, b) { return (_this.getBBox(a.get_representation())[splitAxis] > _this.getBBox(b.get_representation())[splitAxis]) ? 1 : -1; });
        var node2items = items.splice(Math.floor(items.length / 2), items.length);
        parent = node;
        if (node.has_parent_node()) {
            parent = node.get_parent_node();
        }
        var node1value = this.createBoundingBox(items.map(function (e) { return _this.getBBox(e.get_representation()); }));
        var node2value = this.createBoundingBox(node2items.map(function (e) { return _this.getBBox(e.get_representation()); }));
        splitNode1 = new Node_1.Node(node1value, parent, this);
        splitNode2 = new Node_1.Node(node2value, parent, this);
        splitNode1.set_members(items);
        splitNode2.set_members(node2items);
        splitNode1.fix_total_member_count();
        splitNode2.fix_total_member_count();
        if (node.has_parent_node()) {
            var relationsList = [ChildRelation_1.ChildRelation.GeospatiallyContainsRelation, ChildRelation_1.ChildRelation.GeospatiallyContainsRelation];
            var newChildrenList = [splitNode1, splitNode2];
            var valuesList = [node1value, node2value];
            parent.swapChildren(node, relationsList, newChildrenList, valuesList);
            parent.fix_total_member_count();
            this.get_cache().delete_node(node); // delete fragment cause we will only accept one node per fragment
        }
        else {
            node.clear();
            node.add_child(ChildRelation_1.ChildRelation.GeospatiallyContainsRelation, splitNode1, node1value);
            node.add_child(ChildRelation_1.ChildRelation.GeospatiallyContainsRelation, splitNode2, node2value);
            node.fix_total_member_count();
            this.set_root_node_identifier(node.get_identifier());
            parent = node;
        }
        if (parent.get_children_identifiers_with_relation(ChildRelation_1.ChildRelation.GeospatiallyContainsRelation).length >= this.max_fragment_size) {
            this.splitNode(parent, null);
        }
        if (addedMember !== null) {
            // We need to return the node where the treedataobject ended up.
            if (splitNode1.get_members().indexOf(addedMember) != -1) {
                return splitNode1;
            }
            else {
                return splitNode2;
            }
        }
        return node;
    };
    RTree.prototype.splitInnerNode = function (node) {
        var parent = null;
        var splitNode1 = null;
        var splitNode2 = null;
        var childrenIdentifiers = node.get_children_identifiers_with_relation(ChildRelation_1.ChildRelation.GeospatiallyContainsRelation);
        var totalEntryBBoxes = childrenIdentifiers.map(function (e) { return e.value.bbox(); });
        // let membersEntryBboxes = node.get_members().map(e => e.get_representation().bbox())
        // let totalEntryBBoxes = entryBboxes.concat(membersEntryBboxes)
        var splitAxis = this.chooseAxis(totalEntryBBoxes, node.get_identifier().value.bbox()); // 0 == split on X axis, 1 == split on Y axis
        var node1members = new Array();
        var node2members = new Array();
        var node1childrenIdentifiers = new Array();
        var node2childrenIdentifiers = new Array();
        if (splitAxis !== 0 && splitAxis !== 1) {
            throw new Error("invalid axis passed to the distribute function");
        }
        var items = totalEntryBBoxes;
        items = items.sort(function (a, b) { return (a[splitAxis] > b[splitAxis]) ? 1 : -1; });
        var splitValue = items[Math.floor(items.length / 2)][splitAxis];
        var node1bboxes = [];
        var node2bboxes = [];
        for (var _i = 0, _a = node.get_members(); _i < _a.length; _i++) {
            var member = _a[_i];
            if (member.get_representation().bbox()[splitAxis] <= splitValue) {
                node1members.push(member);
                node1bboxes.push(member.get_representation().bbox());
            }
            else {
                node2members.push(member);
                node2bboxes.push(member.get_representation().bbox());
            }
        }
        for (var _b = 0, childrenIdentifiers_1 = childrenIdentifiers; _b < childrenIdentifiers_1.length; _b++) {
            var childIdentifier = childrenIdentifiers_1[_b];
            if (childIdentifier.value.bbox()[splitAxis] <= splitValue) {
                node1childrenIdentifiers.push(childIdentifier);
                node1bboxes.push(childIdentifier.value.bbox());
            }
            else {
                node2childrenIdentifiers.push(childIdentifier);
                node2bboxes.push(childIdentifier.value.bbox());
            }
        }
        var node1value = this.createBoundingBox(node1bboxes);
        var node2value = this.createBoundingBox(node2bboxes);
        if (node.has_parent_node()) {
            parent = node.get_parent_node();
        }
        else {
            parent = node;
            node.clear();
            var nodeValue = this.createBoundingBox([node1value.bbox(), node2value.bbox()]);
            node.identifier.value = nodeValue;
        }
        splitNode1 = new Node_1.Node(node1value, null, this);
        splitNode2 = new Node_1.Node(node2value, null, this);
        for (var _c = 0, node1childrenIdentifiers_1 = node1childrenIdentifiers; _c < node1childrenIdentifiers_1.length; _c++) {
            var identifier = node1childrenIdentifiers_1[_c];
            splitNode1.add_child(ChildRelation_1.ChildRelation.GeospatiallyContainsRelation, this.get_cache().get_node(identifier), identifier.value);
        }
        for (var _d = 0, node1members_1 = node1members; _d < node1members_1.length; _d++) {
            var member = node1members_1[_d];
            splitNode1.add_data(member);
        }
        for (var _e = 0, node2childrenIdentifiers_1 = node2childrenIdentifiers; _e < node2childrenIdentifiers_1.length; _e++) {
            var identifier = node2childrenIdentifiers_1[_e];
            splitNode2.add_child(ChildRelation_1.ChildRelation.GeospatiallyContainsRelation, this.get_cache().get_node(identifier), identifier.value);
        }
        for (var _f = 0, node2members_1 = node2members; _f < node2members_1.length; _f++) {
            var member = node2members_1[_f];
            splitNode2.add_data(member);
        }
        splitNode1.fix_total_member_count();
        splitNode2.fix_total_member_count();
        if (node.has_parent_node()) {
            var relationsList = [ChildRelation_1.ChildRelation.GeospatiallyContainsRelation, ChildRelation_1.ChildRelation.GeospatiallyContainsRelation];
            var newChildrenList = [splitNode1, splitNode2];
            var valuesList = [node1value, node2value];
            parent.swapChildren(node, relationsList, newChildrenList, valuesList);
            this.get_cache().delete_node(node); // delete fragment cause we will only accept one node per fragment
        }
        else {
            node.add_child(ChildRelation_1.ChildRelation.GeospatiallyContainsRelation, splitNode1, node1value);
            node.add_child(ChildRelation_1.ChildRelation.GeospatiallyContainsRelation, splitNode2, node2value);
            this.set_root_node_identifier(node.get_identifier());
        }
        parent.fix_total_member_count();
        var parentChildren = parent.get_children_identifiers_with_relation(ChildRelation_1.ChildRelation.GeospatiallyContainsRelation);
        if (parentChildren != null && parentChildren.length >= this.max_fragment_size) {
            this.splitNode(parent, null);
        }
        return parent;
    };
    RTree.prototype.createBoundingBox = function (bboxes) {
        var xmin = Math.min.apply(null, bboxes.map(function (e) { return e[0]; }));
        var ymin = Math.min.apply(null, bboxes.map(function (e) { return e[1]; }));
        var xmax = Math.max.apply(null, bboxes.map(function (e) { return e[2]; }));
        var ymax = Math.max.apply(null, bboxes.map(function (e) { return e[3]; }));
        var newBBox = [xmin, ymin, xmax, ymax];
        return this.bboxToGeoJSON(newBBox);
    };
    RTree.prototype.bboxToGeoJSON = function (bbox) {
        return new terraformer.Polygon([[[bbox[0], bbox[1]], [bbox[0], bbox[3]], [bbox[2], bbox[3]], [bbox[2], bbox[1]]]]);
    };
    RTree.prototype.expandBoundingBox = function (bbox1, bbox2) {
        return ([Math.min(bbox1[0], bbox2[0]), Math.min(bbox1[1], bbox2[1]), Math.max(bbox1[2], bbox2[2]), Math.max(bbox1[3], bbox2[3])]);
    };
    RTree.prototype.getBBoxSize = function (bbox) {
        return Math.abs(bbox[2] - bbox[0]) * Math.abs(bbox[3] - bbox[1]);
    };
    RTree.prototype.getBBox = function (dataGeoObject) {
        var result = dataGeoObject.bbox();
        return result === undefined ? new Error("Trying to parse an incorrect wkt string") : result;
    };
    RTree.prototype.findContainingChild = function (childrenIdentifiers, dataGeoObject) {
        for (var _i = 0, childrenIdentifiers_2 = childrenIdentifiers; _i < childrenIdentifiers_2.length; _i++) {
            var childIdentifier = childrenIdentifiers_2[_i];
            if (this.isContained(dataGeoObject, childIdentifier.value)) {
                return this.get_cache().get_node(childIdentifier);
            }
        }
        return null;
    };
    RTree.prototype.findContainingOrOverlappingChildren = function (childrenIdentifiers, dataGeoObject) {
        var children = [];
        for (var _i = 0, childrenIdentifiers_3 = childrenIdentifiers; _i < childrenIdentifiers_3.length; _i++) {
            var childIdentifier = childrenIdentifiers_3[_i];
            if (this.isContained(dataGeoObject, childIdentifier.value) || this.isOverlapping(dataGeoObject, childIdentifier.value)) {
                children.push(this.get_cache().get_node(childIdentifier));
            }
        }
        return children;
    };
    RTree.prototype.isContained = function (dataGeoObject, childGeoObject) {
        if (childGeoObject instanceof terraformer.Point) {
            return false;
        } // Point cannot contain other polygon or point
        var childWKTPrimitive = new terraformer.Primitive(childGeoObject);
        try {
            return (childWKTPrimitive.contains(dataGeoObject));
        }
        catch (err) {
            return false;
        }
    };
    RTree.prototype.isOverlapping = function (dataGeoObject, childGeoObject) {
        if (childGeoObject instanceof terraformer.Point || dataGeoObject instanceof terraformer.Point) {
            return false;
        } // Point cannot contain other polygon or point
        var childWKTPrimitive = new terraformer.Primitive(childGeoObject);
        try {
            return (childWKTPrimitive.intersects(dataGeoObject));
        }
        catch (err) {
            return false;
        }
    };
    RTree.prototype.chooseAxis = function (entryBboxes, containerBBox) {
        var _a = this.pickSeeds(entryBboxes), seed1index = _a[0], seed2index = _a[1]; // find two most distant rectangles of the current node
        var seed1bbox = entryBboxes[seed1index];
        var seed2bbox = entryBboxes[seed2index];
        var Xdistance = 0;
        var Ydistance = 0;
        var Xoverlap = false;
        var Yoverlap = false;
        var containerXsize = Math.abs(containerBBox[2] - containerBBox[0]);
        var containerYsize = Math.abs(containerBBox[3] - containerBBox[1]);
        var _b = seed1bbox[0] < seed2bbox[0] ? [seed1bbox, seed2bbox] : [seed2bbox, seed1bbox], smallestXaxisBBox = _b[0], largestXaxisBBox = _b[1];
        if (smallestXaxisBBox[0] < largestXaxisBBox[0]) {
            if (smallestXaxisBBox[2] < largestXaxisBBox[0]) {
                // no overlap on X axis
                Xdistance = Math.abs(largestXaxisBBox[0] - smallestXaxisBBox[2]); // / containerXsize
                Xoverlap = false;
            }
            else if (smallestXaxisBBox[2] < largestXaxisBBox[2]) {
                // Both bboxes overlap on X axis
                Xdistance = Math.abs(smallestXaxisBBox[2] - largestXaxisBBox[0]); // / containerXsize
                Xoverlap = true;
            }
            else if (smallestXaxisBBox[2] < largestXaxisBBox[0]) {
                // full overlap (node 2 in node 1 on X axis)
                Xdistance = Math.abs(largestXaxisBBox[2] - largestXaxisBBox[0]); // / containerXsize
                Xoverlap = true;
            }
        }
        var _c = seed1bbox[1] < seed2bbox[1] ? [seed1bbox, seed2bbox] : [seed2bbox, seed1bbox], smallestYaxisBBox = _c[0], largestYaxisBBox = _c[1];
        if (smallestYaxisBBox[1] < largestYaxisBBox[1]) {
            if (smallestYaxisBBox[3] < largestYaxisBBox[1]) {
                // no overlap on Y axis
                Ydistance = Math.abs(largestYaxisBBox[1] - smallestYaxisBBox[3]); // / containerYsize
                Yoverlap = false;
            }
            else if (smallestYaxisBBox[3] < largestYaxisBBox[3]) {
                // Both bboxes overlap on Y axis
                Ydistance = Math.abs(smallestYaxisBBox[3] - largestYaxisBBox[1]); // / containerYsize
                Yoverlap = true;
            }
            else if (smallestYaxisBBox[3] < largestYaxisBBox[1]) {
                // full overlap (node 2 in node 1 on Y axis)
                Ydistance = Math.abs(largestYaxisBBox[3] - largestYaxisBBox[1]); // / containerYsize
                Yoverlap = true;
            }
        }
        if (Xoverlap) {
            if (Yoverlap) {
                // yes Xoverlap, yes Yoverlap
                return Xdistance < Ydistance ? 0 : 1; // Split on the smallest distance => x distance smaller -> split X axis ( = 0 )
            }
            else {
                // yes Xoverlap, no Yoverlap
                return 1; // So we split the Y axis
            }
        }
        else if (Yoverlap) {
            // no Xoverlap, yes Yoverlap
            return 0; // So we split the X axis
        }
        else {
            // no Xoverlap, no Yoverlap
            return Xdistance < Ydistance ? 1 : 0; // Split on the largest distance => y distance bigger -> split y axis ( = 1 )
        }
    };
    RTree.prototype.pickSeeds = function (boundingBoxList) {
        var maxDValue = 0;
        var maxDItemIndices = [0, 1];
        for (var i = 0; i < boundingBoxList.length - 1; i++) {
            for (var j = i + 1; j < boundingBoxList.length; j++) {
                var R = this.expandBoundingBox(boundingBoxList[i], boundingBoxList[j]);
                var d = this.getBBoxSize(R) - this.getBBoxSize(boundingBoxList[i]) - this.getBBoxSize(boundingBoxList[j]);
                if (d > maxDValue) {
                    maxDValue = d;
                    maxDItemIndices = [i, j];
                }
            }
        }
        return maxDItemIndices;
    };
    return RTree;
}(Tree_1.Tree));
exports.RTree = RTree;
//# sourceMappingURL=RTree.js.map