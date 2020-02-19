# Tree structured fragmentations of an RDF data collection.
This project handles the creation of tree structured fragmentations of a collection of RDF data.
This is based on the ontology that can be found here: https://github.com/pietercolpaert/TREE.

Tree structured fragmentations of an RDF data collection provide a way for clients to filter the data objects of a collection over the Web with a minimal server cost.
For every predicate of the stored data that needs to be filtered, a tree data structure has to be constructed that indexes the data over that predicate value. 
If these fragmentations are published over the Web, clients can use them to efficiently filter the data objects of the data set over the predicates for which tree structured fragmentations are available.
A client implementation can be found here: https://github.com/Dexagod/ldf_tree_client.

When publishing the tree structured fragmentations over the Web, it is important to enable caching on both the server and the client, as this will increase the querying performance of the clients over the fragmentation.

Currently, four data structure types are supported: Prefix tree, R-tree, B-tree and Paged List (Hydra PartialCollectionView).


```
import * as ldtree from "linkeddatatree"


let source_path = "data/"
let tree_path = "tree/"
let shacl_path = "http://www.w3.org/2000/01/rdf-schema#label"
let max_cached_fragments = 1000000
let max_fragment_size = 100

// Currently there are 3 available tree data structures (and support for Hydra PartialCollectionView)
let treeManager = new ldtree.PrefixTreeManager()
                // = new ldtree.BTreeManager()
                // = new ldtree.RTreeManager()
                // = new ldtree.HydraPartialCollectionViewManager()

// Creating the tree object
let tree = treeManager.createTree(
    source_path,            // Folder that is root of the identifiers of the tree fragments.
    tree_path,              // Relative path fron the source folder to the location of the tree fragments
    shacl_path,             // The schacl:path indicating the predicate value used to index the data objects in the tree structure,
    max_cached_fragments,   // Maximum fragments that can be kept in the cache while creating the tree. Allows streaming creation of tree. Defaults to Infinity (Currently streaming creation is very slow, and is not advised).
    max_fragment_size)      // The maximum fragment size parameter indicates the maximum allowed data objects to be present in a single fragment. Defaults to 100.
                            // Generally, smaller values for the max_fragment_size parameter will give more consistent performance over different dataset sizes.

// Creating a data object to add to the tree
let key_value = "Wolfgang Amadeus Mozart"      // This key value is a temporary solution. In following iterations, this will be derived from the RDF data object based on the shacl_path predicate that has been provided on the creation of the tree.
// Currently, data objects added to the tree are required to be presented in a JSON-LD format.
let data_object = { "@id": "http://dbpedia.org/resource/Wolfgang_Amadeus_Mozart",  
                    "@type": "http://dbpedia.org/ontology/Person",
                    "http://www.w3.org/2000/01/rdf-schema#label": "Wolfgang Amadeus Mozart"}    

tree.addData(key_value, data_object)           // The key_value parameter will be removed in later iterations, and will be derived from the RDF data object based ont he shacl_path predicate value.
// Add all the necessary data to the tree data structure.
tree.doneAdding() // This flushes the cache to the disk, so that the current status of the tree structured fragmentation is written to the disk.

// The fragments of the tree have now been written to the disk on the path: source_path + tree_path
// The collection object in the root node fragment can be found on the location: source_path + tree_path + node0.jsonld#Collection

// The tree can be read from disk to make alterations using the following approach
let newtree = treeManager.readTree(
    source_path,           
    tree_path,             
    shacl_path,             // In future itearations this will be derived from context,
    max_cached_fragments,   // In future itearations this will be derived from context.
    max_fragment_size)      // In future itearations this will be derived from context.

newtree.addData(key_value2, data_object20   // add new items to the tree

newtree.doneAdding()                        // flush cache after changes
```
