import { Member } from "../DataObjects/Member";
import { Node } from "../Node/Node";
import { ChildRelation } from '../Relations/ChildRelation';
import { Cache } from "../Cache/Cache";
import { Identifier } from '../Identifier';
import { Tree } from '../Tree/Tree';
import { Relation } from '../Relation';
import TreeConfig from '../TreeConfig';

import fs = require('fs');


const defaultContext = {
  "tree": "https://w3id.org/tree#",
  "hydra": "http://www.w3.org/ns/hydra/core#",
  "geo": "http://www.w3.org/2003/01/geo/wgs84_pos#",
  "void": "https://www.w3.org/TR/void/#"
}

export class NodeIO{
    sourceDirectory: string;
    dataFolder: string;
    shaclPath : any;
    writeMetadata: boolean;
    config : TreeConfig;
    context : Object | null = null;
  /**
   * Initialize the fragment IO managing object.
   * @param {string} sourceDirectory - The source directory where all data of this tree is stored.
   * @param {string} dataFolder - The subfolder of the source directory where the fragments are stored.
   */
  constructor(config: TreeConfig){
    if(!config['rootDir']) throw new Error('A "rootDir" parameter is required. This parameter indicates the root of the identifiers that are stored in the tree.')
    if(!config['dataDir']) throw new Error('A "dataDir" parameter is required. This parameter is the relative path to the "rootDir" where the fragments of the tree are stored.')
    if(!config['treePath']) throw new Error('A "treePath" parameter is required. This parameter sets the tree:path for all relations in the tree.')
    this.sourceDirectory = config['rootDir'];
    this.dataFolder = config['dataDir'];
    this.shaclPath = config['treePath'];
    this.writeMetadata = config['writeMetadata'] || true;
    this.config = config;
  }

  write_node_batch(nodeArray: Array<Node>) {
    for (var index = 0; index < nodeArray.length; index++){
      this.write_node(nodeArray[index])
    }
  }

  delete_node(nodeId: string){
    if (nodeId === null || nodeId === undefined) {  return};
    let location = this.getNodeLocation(nodeId)
    if (fs.existsSync(location)){
      fs.unlinkSync(location)
    }
  }
  
  write_node(node: Node) {
    let location = this.getNodeLocation(node.get_node_id())
    let [encodedNode, encodedMembers, encodedMemberMetadata] = this.encode_node(node)
    let wrapper = this.encode_wrapper(encodedNode, encodedMembers, encodedMemberMetadata, node.get_remainingItems()) // TODO:: fix for correct amount of total items?
    let JSONSTRING = JSON.stringify(wrapper, function(key, value) {
        return (key == 'fc') ? undefined : value;
    });
    fs.writeFileSync(location, JSONSTRING, {encoding: 'utf-8'})    
  }

  read_node(nodeId: string, fc: Cache) {
    let location = this.getNodeLocation(nodeId)
    let input_string = fs.readFileSync(location, {encoding: 'utf-8'})
    let wrapper = JSON.parse(input_string);
    let [node, members, membersMetadata, totalItems] = this.decode_wrapper(wrapper);
    node = this.decode_node(node, members, membersMetadata, fc);
    return node
  }

  writeTreeMetadata(tree : Tree) {
    this.config.nodeCount = tree.node_count;
    fs.writeFileSync(this.sourceDirectory + this.dataFolder + 'config.json', JSON.stringify(this.config, null, 2));
  }

  static readTree(config : TreeConfig, prototypeObject : any, nodeIOPrototype : any){
    let rootNodeId = config.dataDir + "node0.jsonld";
    let rootNodeLocation = config.rootDir + rootNodeId;
    let input_string = fs.readFileSync(rootNodeLocation, {encoding: 'utf-8'})
    let wrapper = JSON.parse(input_string);
    let tree : any = {}
    tree["cache"] = new Cache(config['rootDir'], config['dataDir'], config['fragmentSize'], new nodeIOPrototype(config))
    tree["root_node_identifier"] = new Identifier((wrapper["void:subset"]||wrapper["tree:view"])["@id"], null);
    tree["max_fragment_size"] = config['fragmentSize']
    tree["node_count"] = config['nodeCount']
    Object.setPrototypeOf(tree, prototypeObject.prototype)

    return tree

  }

  encode_wrapper(encodedNode : any, encodedMembers: any, encodedMembersMetadata : any, totalItems = 0) : any {
    let wrapper : any = {
      "@context": this.getContext(),
      "@id": this.getCollectionId(),
      "@type" : "hydra:Collection",
      "tree:remainingItems" : totalItems,
      "hydra:member" : encodedMembers
    }
    if (encodedNode['@id'].endsWith('node0.jsonld'))
      wrapper["tree:view"] = encodedNode
    else
      wrapper["void:subset"] = encodedNode
    if (this.writeMetadata)
      wrapper["memberMetadata"] = encodedMembersMetadata;
    return wrapper
  }
  
  decode_wrapper(wrapper : any){
    let node = wrapper["void:subset"] || wrapper['tree:view']
    let members = wrapper["hydra:member"]
    let membersMetadata =  wrapper["memberMetadata"]
    let totalItems =  wrapper["tree:remainingItems"]
    return [node, members, membersMetadata, totalItems]
  }

  encode_node(node: Node) : any {   

    let member_objects = []
    let member_metadata = []
    for (var i = 0; i < node.members.length; i++){
      let encoded_member = this.encode_member(node.members[i])
      member_objects.push(encoded_member[0])
      member_metadata.push(encoded_member[1])
    }

    let relationList = []
    for (let relation of node.get_children()){
      relationList.push(this.encode_relation(relation))
    }
    
    let writtenNode: EncodedNode = {
      "@id": this.getNodeIdFromIdentifier(node.get_node_id()),
      "@type": "tree:Node",
      "tree:remainingItems": node.remainingItems,
      "metadataValue" : this.encode_node_value(node.get_identifier().value)
    };
    
    if (relationList.length !== 0){
      writtenNode["tree:relation"] = relationList
    }

    let parentNode = node.get_parent_node_identifier()
    if (parentNode !== null){
      writtenNode["parent_node"] = 
        {
          "@id": this.getNodeIdFromIdentifier( parentNode.nodeId ),
          "@type": "tree:Node"
        }
    }

    return [writtenNode, member_objects, member_metadata];
  }

  decode_node(node: any, members : any, membersMetadata : any, fc:Cache){
    Object.setPrototypeOf(node, Node.prototype)
    let nodeMetadataValue = node['metadataValue']
    node["identifier"] = this.retrieveNodeIdentifier(node["@id"], nodeMetadataValue) // node["@id"].replace(this.dataFolder + "fragment", "").replace(".jsonld", "").split("#")

    delete node["@id"];
    delete node["@type"];
    delete node["metadataValue"]

    let member_list = [];
    for (var j = 0; j < members.length; j++){
      let member = this.decode_member(members[j], membersMetadata[j])
      member_list.push(member)
    }
    node["members"] = member_list

    
    if (node.hasOwnProperty('tree:relation')){
      let nodeChildRelationsList = node["tree:relation"];
      node["children"] = new Array()

      for (let nodeChildRelation of nodeChildRelationsList){
        let relation = this.decode_relation(nodeChildRelation)
        node["children"].push(relation)
      }
    } else {
      node["children"] = new Array()
    }


    if (node.parent_node != null){
      node.parent_node = this.retrieveNodeIdentifier(node.parent_node["@id"], null)  //parent node does not need information about value, should in fact be removed from tree since unnecessary
    }
    node["fc"] = fc
    node["remainingItems"] = node["tree:remainingItems"]

    if (node["parent_node"] === undefined) { node ["parent_node"] = null}
    
    // delete node["@graph"]
    delete node.members_metadata;
    
    return node;
  }

  encode_member(member: Member){
    return [member.contents, this.encode_tdo_value(member.representation), member.size]
  }

  decode_member(member: any, representation: any): Member{
    let memberObject : any = {}
    memberObject["size"] = 1
    memberObject["contents"] = member
    memberObject["representation"] = this.decode_tdo_value(representation)
    Object.setPrototypeOf(memberObject, Member.prototype)
    return memberObject
  }

  encode_relation(relation : Relation){
    // TODO:: set shacl path
    if (relation.path === null){
      relation.path = this.shaclPath;
    }
  
    if (relation.identifier.nodeId === "/rtree_streets/1/node76.jsonld"){
    }
    return  {
      "@type" : this.relationToString(relation.type),
      "tree:node" : { "@id": this.getNodeIdFromIdentifier(relation.identifier.nodeId) },
      "tree:path" : relation.path,
      "tree:value" : this.encode_node_value(relation.value),
    }
  }

  decode_relation(childRelationObject : any){
    // TODO:: process shacl path
    let relationType = this.stringToRelation(childRelationObject["@type"].substring(5))
    let relationIdentifier = this.retrieveNodeIdentifier(childRelationObject["tree:node"]["@id"], this.decode_node_value(childRelationObject["tree:value"]))
    let relationValue = this.decode_node_value(childRelationObject["tree:value"])
    let shaclPath = childRelationObject["tree:path"]
    return new Relation(relationType, relationValue, relationIdentifier, shaclPath)
  }

  getCollectionId(){
    return this.getRootNodeIdentifier() + "#Collection"
  }

  getNodeLocation(nodeId: string){
    let location = this.sourceDirectory + nodeId

    let nodelocation : any = location.split("/")
    let nodeDirectory = nodelocation.slice(0, nodelocation.length-1).join("/")
    if (!fs.existsSync(nodeDirectory)) {
        fs.mkdirSync(nodeDirectory, {recursive : true});  
    }
    return location
  }
  
  getNodeIdFromIdentifier(nodeId: string){
    return nodeId
    // return "/" + this.dataFolder + "node" + nodeId.toString() + ".jsonld"
  }
  
  retrieveNodeIdentifier(nodeId: string, value: any): Identifier{
    if (nodeId === null) { throw new Error("requesting node with null id") }
    else { return new Identifier(nodeId, value); }
  }

  relationToString(relation: ChildRelation): string { return "tree:" + relation}

  stringToRelation(relationString: string): ChildRelation{ 
    let childRelation : ChildRelation = (<any> ChildRelation)[relationString]
    return childRelation
    }

  encode_node_value(a : any){
    return a;
  }
  encode_tdo_value(a : any){
    return a;
  }

  decode_node_value(a : any){
    return a;
  }
  decode_tdo_value(a : any){
    return a;
  }

  getRootNodeIdentifier(){
    return "/" + this.dataFolder + "node0.jsonld";
  }

  getContext(){
    return {...defaultContext, ...this.config.context}
  }
}

interface EncodedNode {
  "@id": any,
  "@type": string,
  "tree:remainingItems": any;
  "parent_node" ? : any
  "tree:relation" ? : any,
  "metadataValue": any
}
