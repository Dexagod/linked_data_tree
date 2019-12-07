"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Member_1 = require("../DataObjects/Member");
var Node_1 = require("../Node/Node");
var ChildRelation_1 = require("../Relations/ChildRelation");
var Cache_1 = require("../Cache/Cache");
var Identifier_1 = require("../Identifier");
var Relation_1 = require("../Relation");
var fs = require("fs");
var jsonld = require('jsonld');
var context = {
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
    "foaf": "http://xmlns.com/foaf/0.1/",
    "hydra": "http://www.w3.org/ns/hydra/core#",
    "tree": "https://w3id.org/tree#",
    "schema": "http://schema.org//",
    "value": "tree:value",
    "members": "hydra:member",
    "children": "tree:relation",
    "geo": "http://www.w3.org/2003/01/geo/wgs84_pos#",
    "shacl": "http://www.w3.org/ns/shacl#"
};
var NodeIO = /** @class */ (function () {
    /**
     * Initialize the fragment IO managing object.
     * @param {string} sourceDirectory - The source directory where all data of this tree is stored.
     * @param {string} dataFolder - The subfolder of the source directory where the fragments are stored.
     */
    function NodeIO(sourceDirectory, dataFolder, shaclPath) {
        this.sourceDirectory = sourceDirectory;
        this.dataFolder = dataFolder;
        this.shaclPath = shaclPath;
    }
    NodeIO.prototype.write_node_batch = function (nodeArray) {
        for (var index = 0; index < nodeArray.length; index++) {
            this.write_node(nodeArray[index]);
        }
    };
    NodeIO.prototype.delete_node = function (nodeId) {
        if (nodeId === null || nodeId === undefined) {
            return;
        }
        ;
        var location = this.getNodeLocation(nodeId);
        if (fs.existsSync(location)) {
            fs.unlinkSync(location);
        }
    };
    NodeIO.prototype.write_node = function (node) {
        var location = this.getNodeLocation(node.get_node_id());
        var _a = this.encode_node(node), encodedNode = _a[0], encodedMembers = _a[1], encodedMemberMetadata = _a[2];
        var wrapper = this.encode_wrapper(encodedNode, encodedMembers, encodedMemberMetadata, node.get_total_member_count()); // TODO:: fix for correct amount of total items?
        var JSONSTRING = JSON.stringify(wrapper, function (key, value) {
            return (key == 'fc') ? undefined : value;
        });
        fs.writeFileSync(location, JSONSTRING, { encoding: 'utf-8' });
    };
    NodeIO.prototype.read_node = function (nodeId, fc) {
        var location = this.getNodeLocation(nodeId);
        var input_string = fs.readFileSync(location, { encoding: 'utf-8' });
        var wrapper = JSON.parse(input_string);
        var _a = this.decode_wrapper(wrapper), node = _a[0], members = _a[1], membersMetadata = _a[2], totalItems = _a[3];
        node = this.decode_node(node, members, membersMetadata, fc);
        return node;
    };
    NodeIO.prototype.writeTreeRoot = function (node, tree) {
        var location = this.getNodeLocation(node.get_node_id());
        var _a = this.encode_node(node), encodedNode = _a[0], encodedMembers = _a[1], encodedMemberMetadata = _a[2];
        var wrapper = this.encode_wrapper(encodedNode, encodedMembers, encodedMemberMetadata, node.get_total_member_count()); // TODO:: fix for correct amount of total items?
        var treeMetadata = [tree.max_fragment_size, tree.node_count, tree.options];
        wrapper["treeMetadata"] = treeMetadata;
        var JSONSTRING = JSON.stringify(wrapper, function (key, value) {
            return (key == 'fc') ? undefined : value;
        });
        fs.writeFileSync(location, JSONSTRING, { encoding: 'utf-8' });
        var returnwrapper = Object.assign(wrapper);
        delete returnwrapper["treeMetadata"];
        delete returnwrapper["memberMetadata"];
        delete returnwrapper["hydra:member"];
        return wrapper;
    };
    NodeIO.prototype.readTree = function (prototypeObject) {
        var nodeId = 0;
        var location = this.getNodeLocation(nodeId);
        var input_string = fs.readFileSync(location, { encoding: 'utf-8' });
        var wrapper = JSON.parse(input_string);
        var treeMetadata = wrapper["treeMetadata"];
        var max_fragment_size = treeMetadata[0], node_count = treeMetadata[1], options = treeMetadata[2];
        var tree = {};
        tree["cache"] = new Cache_1.Cache(this.sourceDirectory, this.dataFolder, max_fragment_size, this);
        tree["root_node_identifier"] = this.retrieveNodeIdentifier(wrapper["hydra:view"]["@id"], null);
        tree["max_fragment_size"] = max_fragment_size;
        tree["node_count"] = node_count;
        tree["options"] = options;
        tree["options"] = options;
        Object.setPrototypeOf(tree, prototypeObject.prototype);
        return tree;
    };
    NodeIO.prototype.encode_wrapper = function (encodedNode, encodedMembers, encodedMembersMetadata, totalItems) {
        if (totalItems === void 0) { totalItems = 0; }
        return {
            "@context": context,
            "@id": this.getCollectionId(),
            "@type": "hydra:Collection",
            "tree:remainingItems": totalItems,
            "hydra:view": encodedNode,
            "hydra:member": encodedMembers,
            "memberMetadata": encodedMembersMetadata,
        };
    };
    NodeIO.prototype.decode_wrapper = function (wrapper) {
        var node = wrapper["hydra:view"];
        var members = wrapper["hydra:member"];
        var membersMetadata = wrapper["memberMetadata"];
        var totalItems = wrapper["tree:remainingItems"];
        return [node, members, membersMetadata, totalItems];
    };
    NodeIO.prototype.encode_node = function (node) {
        var member_objects = [];
        var member_metadata = [];
        for (var i = 0; i < node.members.length; i++) {
            var encoded_member = this.encode_member(node.members[i]);
            member_objects.push(encoded_member[0]);
            member_metadata.push(encoded_member[1]);
        }
        var relationList = [];
        for (var _i = 0, _a = node.get_children(); _i < _a.length; _i++) {
            var relation = _a[_i];
            relationList.push(this.encode_relation(relation));
        }
        var writtenNode = {
            "@id": this.getNodeIdFromIdentifier(node.get_node_id()),
            "@type": "tree:Node",
            "tree:remainingItems": node.remainingItems,
            "metadataValue": this.encode_node_value(node.get_identifier().value)
        };
        if (relationList.length !== 0) {
            writtenNode["children"] = relationList;
        }
        var parentNode = node.get_parent_node_identifier();
        if (parentNode !== null) {
            writtenNode["parent_node"] =
                {
                    "@id": this.getNodeIdFromIdentifier(parentNode.nodeId),
                    "@type": "tree:Node"
                };
        }
        return [writtenNode, member_objects, member_metadata];
    };
    NodeIO.prototype.decode_node = function (node, members, membersMetadata, fc) {
        Object.setPrototypeOf(node, Node_1.Node.prototype);
        node["value"] = this.decode_node_value(node["metadataValue"]);
        node["identifier"] = this.retrieveNodeIdentifier(node["@id"], node["value"]); // node["@id"].replace(this.dataFolder + "fragment", "").replace(".jsonld", "").split("#")
        delete node["@id"];
        delete node["@type"];
        var member_list = [];
        for (var j = 0; j < members.length; j++) {
            var member = this.decode_member(members[j]);
            member.representation = membersMetadata[j];
            member_list.push(member);
        }
        node["members"] = member_list;
        if (node.hasOwnProperty('children')) {
            var nodeChildRelationsList = node["children"];
            node["children"] = new Array();
            for (var _i = 0, nodeChildRelationsList_1 = nodeChildRelationsList; _i < nodeChildRelationsList_1.length; _i++) {
                var nodeChildRelation = nodeChildRelationsList_1[_i];
                var relation = this.decode_relation(nodeChildRelation);
                node["children"].push(relation);
            }
        }
        else {
            node["children"] = new Array();
        }
        if (node.parent_node != null) {
            node.parent_node = this.retrieveNodeIdentifier(node.parent_node["@id"], null); //parent node does not need information about value, should in fact be removed from tree since unnecessary
        }
        node["fc"] = fc;
        node["remainingItems"] = node["tree:remainingItems"];
        // delete node["@graph"]
        delete node.members_metadata;
        delete node["metadataValue"];
        delete node["tree:remainingItems"];
        return node;
    };
    NodeIO.prototype.encode_member = function (member) {
        return [member.contents, this.encode_tdo_value(member.representation)];
    };
    NodeIO.prototype.decode_member = function (member) {
        Object.setPrototypeOf(member, Member_1.Member.prototype);
        if (member.representation !== undefined) {
            member.representation = this.decode_tdo_value(member.representation);
        }
        return member;
    };
    NodeIO.prototype.encode_relation = function (relation) {
        // TODO:: set shacl path
        return {
            "@type": this.relationToString(relation.type),
            "tree:node": this.getNodeIdFromIdentifier(relation.identifier.nodeId),
            "shacl:path": this.shaclPath,
            "value": this.encode_node_value(relation.value),
        };
    };
    NodeIO.prototype.decode_relation = function (childRelationObject) {
        // TODO:: process shacl path
        var relationType = this.stringToRelation(childRelationObject["@type"].substring(5));
        var relationIdentifier = this.retrieveNodeIdentifier(childRelationObject["tree:node"], this.decode_node_value(childRelationObject["value"]));
        var relationValue = this.decode_node_value(childRelationObject["value"]);
        return new Relation_1.Relation(relationType, relationValue, relationIdentifier);
    };
    NodeIO.prototype.getCollectionId = function () {
        return this.getNodeIdFromIdentifier(0) + "#collection";
    };
    NodeIO.prototype.getNodeLocation = function (nodeId) {
        return this.sourceDirectory + this.dataFolder + "node" + nodeId.toString() + ".jsonld";
        // return this.dataFolder + "node" + nodeId.toString() + ".jsonld"
    };
    NodeIO.prototype.getNodeIdFromIdentifier = function (nodeId) {
        return "/" + this.dataFolder + "node" + nodeId.toString() + ".jsonld";
    };
    NodeIO.prototype.retrieveNodeIdentifier = function (str, value) {
        // let nodeId = str.replace(this.sourceDirectory + this.dataFolder + "node", "").replace("/","").replace(".jsonld", "");
        var nodeId = str.replace(this.dataFolder + "node", "").replace("/", "").replace(".jsonld", "");
        if (nodeId === null) {
            throw new Error("requesting node with null id");
        }
        else {
            return new Identifier_1.Identifier(parseInt(nodeId), value);
        }
    };
    NodeIO.prototype.relationToString = function (relation) { return "tree:" + relation; };
    NodeIO.prototype.stringToRelation = function (relationString) {
        var childRelation = ChildRelation_1.ChildRelation[relationString];
        return childRelation;
    };
    NodeIO.prototype.encode_node_value = function (a) {
        return a;
    };
    NodeIO.prototype.encode_tdo_value = function (a) {
        return a;
    };
    NodeIO.prototype.decode_node_value = function (a) {
        return a;
    };
    NodeIO.prototype.decode_tdo_value = function (a) {
        return a;
    };
    return NodeIO;
}());
exports.NodeIO = NodeIO;
//# sourceMappingURL=NodeIO.js.map