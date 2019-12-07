"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require('fs');
var Cache = /** @class */ (function () {
    /**
     * This class acts as a cache for all the Fragment objects.
     * @param {string} sourceDirectory - Root folder of the tree data.
     * @param {string} dataFolder - Folder containing the fragment data.
     * @param {number} max_cache_size - Max amount of items allowed in the cache.
     */
    function Cache(sourceDirectory, dataFolder, max_cache_size, nodeIO) {
        if (max_cache_size === void 0) { max_cache_size = 1000; }
        this.cache = new Map();
        this.last_used_cache_counter = 0;
        this.cache_hits = new Map();
        this.nodeLocationFolder = sourceDirectory + dataFolder;
        this.max_cache_size = max_cache_size;
        this.sourceDirectory = sourceDirectory;
        this.dataFolder = dataFolder;
        this.cache_misses = 0;
        this.cache_cleans = 0;
        this.writes = 0;
        this.reads = 0;
        this.CACHE_CUTOFF_DIVISOR = 3;
        // Create dirs if non existent.
        if (!fs.existsSync(sourceDirectory)) {
            fs.mkdirSync(sourceDirectory, { recursive: true });
        }
        if (!fs.existsSync(this.nodeLocationFolder)) {
            fs.mkdirSync(this.nodeLocationFolder, { recursive: true });
        }
        this.nodeIO = nodeIO;
    }
    Cache.prototype.add_node = function (node) {
        this.cache.set(node.get_node_id(), node);
        this.cache_hits.set(node.get_node_id(), this.assign_cache_counter());
        // Clean cache on overflow
        if (Object.keys(this.cache).length > this.max_cache_size) {
            this.clean_cache();
        }
    };
    /**
     * cache counter to keep track of lru items.
     */
    Cache.prototype.assign_cache_counter = function () {
        this.last_used_cache_counter += 1;
        return this.last_used_cache_counter;
    };
    Cache.prototype.get_node_by_id = function (nodeId) {
        if (this.cache.has(nodeId)) {
            this.cache_hits.set(nodeId, this.assign_cache_counter());
            return this.getNodeFromCache(nodeId);
        }
        else {
            this.cache_misses += 1;
            return this.import_node(nodeId);
        }
    };
    Cache.prototype.get_node = function (identifier) {
        return this.get_node_by_id(identifier.nodeId);
    };
    Cache.prototype.list_nodes = function () {
        var fc = this;
        var values = Object.keys(this.cache).map(function (key) {
            return fc.getNodeFromCache(parseInt(key));
        });
        return values;
    };
    Cache.prototype.delete_node = function (node) {
        this.cache.delete(node.get_node_id());
        this.cache_hits.delete(node.get_node_id());
    };
    Cache.prototype.delete_node_file_by_id = function (nodeId) {
        this.nodeIO.delete_node(nodeId);
    };
    Cache.prototype.import_node = function (nodeId) {
        var node = this.read_node_from_file(nodeId);
        this.add_node(node);
        return node;
    };
    Cache.prototype.read_node_from_file = function (nodeId) {
        this.reads += 1;
        var result = this.nodeIO.read_node(nodeId, this);
        return result;
    };
    Cache.prototype.write_node_to_file = function (node) {
        this.writes += 1;
        this.cache.delete(node.get_node_id());
        return this.nodeIO.write_node(node);
    };
    Cache.prototype.write_node_batch_to_file = function (index_array) {
        var _this = this;
        this.writes += index_array.length;
        var mapped_array = index_array.map(function (e) { return _this.getNodeFromCache(e); });
        var write_array = [];
        for (var i = 0; i < index_array.length; i++) {
            this.cache.delete(index_array[i]);
            write_array.push(mapped_array[i]);
        }
        this.nodeIO.write_node_batch(write_array);
    };
    Cache.prototype.clean_cache = function () {
        console.log("CLEANING CACHE");
        this.cache_cleans += 1;
        var cache_values = new Array();
        for (var key in this.cache)
            cache_values.push([parseInt(key), this.getCacheHits(parseInt(key))]);
        cache_values.sort(function (a, b) {
            var x = a[1];
            var y = b[1];
            return x < y ? -1 : (x > y ? 1 : 0);
        });
        var cutoff_length = Math.ceil(cache_values.length / this.CACHE_CUTOFF_DIVISOR);
        var index_array = cache_values.slice(0, cutoff_length);
        var mapped_index = index_array.map(function (e) { return e[0]; });
        this.write_node_batch_to_file(mapped_index);
    };
    Cache.prototype.flush_cache = function (tree) {
        var keyArray = Array.from(this.cache.keys());
        keyArray.splice(keyArray.indexOf(0), 1); // remove rootNode from keys
        var rootNode = this.cache.get(0);
        this.write_node_batch_to_file(keyArray);
        this.cache.delete(0);
        if (rootNode === undefined) {
            throw new Error("Cannot write rootnode to file since rootnode is undefined.");
        }
        return this.nodeIO.writeTreeRoot(rootNode, tree);
    };
    Cache.prototype.getNodeFromCache = function (nodeId) {
        var node = this.cache.get(nodeId);
        if (node === undefined || node === null)
            throw new Error("Requested id is not in the node cache or is null");
        return node;
    };
    Cache.prototype.getCacheHits = function (nodeId) {
        var hits = this.cache_hits.get(nodeId);
        if (hits === undefined || hits === null)
            throw new Error("Requested cache hits are not present in the cache or is null for requested id");
        return hits;
    };
    return Cache;
}());
exports.Cache = Cache;
//# sourceMappingURL=Cache.js.map