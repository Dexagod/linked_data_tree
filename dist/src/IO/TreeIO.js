"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Cache_1 = require("../Cache/Cache");
var Identifier_1 = require("../Identifier");
var fs = require("fs");
var context = {
    "tree": "https://w3id.org/tree#",
    "hydra": "http://www.w3.org/ns/hydra/core#",
    "totalitems": "tree:remainingItems"
};
var TreeIO = /** @class */ (function () {
    function TreeIO(sourceDirectory, dataFolder, treeLocation, treeFile, treeManages) {
        this.treeFile = treeFile;
        this.treeLocation = treeLocation;
        this.sourceDirectory = sourceDirectory;
        this.dataFolder = dataFolder;
        if (!fs.existsSync(sourceDirectory)) {
            fs.mkdirSync(sourceDirectory, { recursive: true });
        }
        if (!fs.existsSync(sourceDirectory + treeLocation)) {
            fs.mkdirSync(sourceDirectory + treeLocation, { recursive: true });
        }
        this.treeManages = treeManages;
    }
    TreeIO.prototype.write_tree = function (tree, writeToFile) {
        if (writeToFile === void 0) { writeToFile = true; }
        var id = this.getCollectionIdentifier();
        var treeRootNodeIdentifier = tree.get_root_node_identifier();
        if (treeRootNodeIdentifier === null) {
            throw new Error("Tree root node is null");
        }
        var writeTreeObj = {
            "@context": context,
            "@id": id,
            "@type": "hydra:Collection",
            "tree:remainingItems": tree.get_root_node().get_total_member_count(),
            "hydra:manages": this.treeManages,
            "hydra:view": { "@id": this.getNodeLocation(treeRootNodeIdentifier.nodeId), "@type": "tree:Node" }
        };
        var JSONSTRING = JSON.stringify(writeTreeObj);
        if (writeToFile) {
            fs.writeFileSync(this.readTreelocation(this.treeFile), JSONSTRING, { encoding: 'utf-8' });
        }
        return writeTreeObj;
    };
    TreeIO.prototype.read_tree = function (prototypeObject, nodeIO) {
        var input_string = fs.readFileSync(this.readTreelocation(this.treeFile), { encoding: 'utf-8' });
        var tree = JSON.parse(input_string);
        tree["cache"] = new Cache_1.Cache(this.sourceDirectory, this.dataFolder, tree.max_fragment_size, nodeIO);
        tree["root_node_identifier"] = this.retrieveNodeIdentifier(tree["hydra:view"]["@id"], null);
        Object.setPrototypeOf(tree, prototypeObject.prototype);
        delete tree["hydra:manages"];
        delete tree["hydra:view"];
        delete tree["@context"];
        return tree;
    };
    TreeIO.prototype.readTreelocation = function (name) {
        return this.sourceDirectory + this.treeLocation + name + ".jsonld";
    };
    TreeIO.prototype.getNodeLocation = function (nodeId) {
        return this.sourceDirectory + this.dataFolder + "node" + nodeId.toString() + ".jsonld";
    };
    TreeIO.prototype.getCollectionIdentifier = function () {
        this.sourceDirectory + this.treeLocation + this.treeFile;
    };
    TreeIO.prototype.retrieveNodeIdentifier = function (str, value) {
        var nodeId = str.replace(this.sourceDirectory + this.dataFolder + "node", "").replace("/", "").replace(".jsonld", "");
        if (nodeId === null) {
            throw new Error("requesting node with null id");
        }
        else {
            return new Identifier_1.Identifier(parseInt(nodeId), value);
        }
    };
    return TreeIO;
}());
exports.TreeIO = TreeIO;
//# sourceMappingURL=TreeIO.js.map