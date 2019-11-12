import { Member } from "../DataObjects/Member";
import { Node } from "../Node/Node";
import { ChildRelation } from '../Relations/ChildRelation';
import { Cache } from "../Cache/Cache";
import { Identifier } from '../Identifier';
import { Tree } from '../Tree/Tree';

import fs = require('fs');
var jsonld = require('jsonld')

var context = {
  "tree": "https://w3id.org/tree#",
  "foaf": "http://xmlns.com/foaf/0.1/",
  "hydra": "http://www.w3.org/ns/hydra/core#",
  "schema": "http://schema.org//",
  "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
  "representation": "https://example.org/Triple#Representation",
  "contents": "hydra: collection",
  "value": "tree:value",
  "members": "hydra:member",
  "children": "tree:hasChildRelation",
  "parent_node": "tree:parent",
  "suggestions": "hydra:member",
  "score": "hydra:value",
  "childcount" : "hydra:totalItems",
  "geo" : "http://www.w3.org/2003/01/geo/wgs84_pos#",
  "shacl" : "http://www.w3.org/ns/shacl#"
}

export class NodeIO{
    sourceDirectory: string;
    treeFile: string;
    treeLocation: string;
    dataFolder: string;
    nodeManages : any;
    nodePath : any;
  /**
   * Initialize the fragment IO managing object.
   * @param {string} sourceDirectory - The source directory where all data of this tree is stored.
   * @param {string} dataFolder - The subfolder of the source directory where the fragments are stored.
   */
  constructor(sourceDirectory: string, dataFolder: string, treeLocation : string, treeFile : string, nodeManages : any, nodePath : any){
    this.sourceDirectory = sourceDirectory;
    this.dataFolder = dataFolder;
    this.nodeManages = nodeManages;
    this.nodePath = nodePath;
    this.treeFile = treeFile;
    this.treeLocation = treeLocation;
  }


  write_node_batch(nodeArray: Array<Node>) {
    for (var index = 0; index < nodeArray.length; index++){
      this.write_node(nodeArray[index])
    }
  }

  delete_node(nodeId: number){
    if (nodeId === null || nodeId === undefined) {  return};
    let location = this.getNodeLocation(nodeId)
    if (fs.existsSync(location)){
      fs.unlinkSync(location)
    }
  }
  
  write_node(node: Node) {
    let location = this.getNodeLocation(node.get_node_id())
    let [encodedNode, encodedMembers, encodedMemberMetadata] = this.encode_node(node)
    let wrapper = this.encode_wrapper(encodedNode, encodedMembers, encodedMemberMetadata, node.get_total_children_count()) // TODO:: fix for correct amount of total items?
    let JSONSTRING = JSON.stringify(wrapper, function(key, value) {
        return (key == 'fc') ? undefined : value;
    });
    fs.writeFileSync(location, JSONSTRING, {encoding: 'utf-8'})    
  }

  read_node(nodeId: number, fc: Cache) {
    let location = this.getNodeLocation(nodeId)
    let input_string = fs.readFileSync(location, {encoding: 'utf-8'})
    let wrapper = JSON.parse(input_string);
    let [node, members, membersMetadata, totalItems] = this.decode_wrapper(wrapper);
    node = this.decode_node(node, members, membersMetadata, fc);
    return node
  }

  writeTreeRoot(node : Node, tree: Tree){
    let location = this.getNodeLocation(node.get_node_id())
    let [encodedNode, encodedMembers, encodedMemberMetadata] = this.encode_node(node)
    let wrapper : any = this.encode_wrapper(encodedNode, encodedMembers, encodedMemberMetadata, node.get_total_children_count()) // TODO:: fix for correct amount of total items?
    let treeMetadata = [tree.max_fragment_size, tree.node_count, tree.options]  
    wrapper["treeMetadata"] = treeMetadata
    let JSONSTRING = JSON.stringify(wrapper, function(key, value) {
        return (key == 'fc') ? undefined : value;
    });
    fs.writeFileSync(location, JSONSTRING, {encoding: 'utf-8'})  
    return wrapper
  }

  readTree(prototypeObject : any) {
    let nodeId = 0;
    let location = this.getNodeLocation(nodeId)
    let input_string = fs.readFileSync(location, {encoding: 'utf-8'})
    let wrapper = JSON.parse(input_string);
    let treeMetadata = wrapper["treeMetadata"]
    let [max_fragment_size, node_count, options] = treeMetadata

    let tree : any = {}
    tree["cache"] = new Cache(this.sourceDirectory, this.dataFolder, max_fragment_size, this)
    tree["root_node_identifier"] = this.retrieveNodeIdentifier(wrapper["hydra:view"]["@id"], null)
    tree["max_fragment_size"] = max_fragment_size
    tree["node_count"] = node_count
    tree["options"] = options
    tree["options"] = options
    Object.setPrototypeOf(tree, prototypeObject.prototype)

    return tree
  }

  
  encode_wrapper(encodedNode : any, encodedMembers: any, encodedMembersMetadata : any, totalItems = 0){
    return {
      "@id": this.getCollectionId(),
      "@type" : "hydra:collection",
      "hydra:totalItems" : totalItems,
      "hydra:view" : encodedNode,
      "hydra:member" : encodedMembers,
      "memberMetadata" : encodedMembersMetadata,
    }
  }
  
  decode_wrapper(wrapper : any){
    let node = wrapper["hydra:view"]
    let members = wrapper["hydra:member"]
    let membersMetadata =  ["memberMetadata"]
    let totalItems =  ["hydra:totalItems"]
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
    for (let entry of Array.from(node.get_children())){
      let relation = entry[0]
      for (let childNodeIdentifier of entry[1]){
        relationList.push(this.encode_relation(relation, childNodeIdentifier))
      }
    }
    
    let writtenNode: EncodedNode = {
      "@id": this.getNodeLocation( node.get_node_id()),
      "@type": "tree:Node",
      "value": this.encode_node_value(node.value),
      "hydra:totalItems": node.total_children_count,
      "hydra:manages" : this.nodeManages,
      "shacl:path" : this.nodePath
    };
    
    if (relationList.length !== 0){
      writtenNode["children"] = relationList
    }

    let parentNode = node.get_parent_node_identifier()
    if (parentNode !== null){
      writtenNode["parent_node"] = 
        {
          "@id": this.getNodeLocation( parentNode.nodeId ),
          "@type": "tree:Node"
        }
    }

    return [writtenNode, member_objects, member_metadata];
  }

  decode_node(node: any, members : any, membersMetadata : any, fc:Cache){
    Object.setPrototypeOf(node, Node.prototype)
    let identifier = this.retrieveNodeIdentifier(node["@id"], node["value"]) // node["@id"].replace(this.dataFolder + "fragment", "").replace(".jsonld", "").split("#")
    node["identifier"] = identifier
    delete node["@id"];
    delete node["@type"];

    let member_list = [];
    for (var j = 0; j < members.length; j++){
      let member = this.decode_member(members[j])
      member.representation = membersMetadata[j]
      member_list.push(member)
    }
    node["members"] = member_list

    
    if (node.hasOwnProperty('children')){
      let nodeChildRelationsList = node["children"];
      node["children"] = new Map()

      for (let nodeChildRelation of nodeChildRelationsList){
        let [childRelationType, childNodeIdentifier] = this.decode_relation(nodeChildRelation)
        if (node["children"].has(childRelationType)){
          node["children"].get(childRelationType).push(childNodeIdentifier)
        } else {
          node["children"].set(childRelationType, [childNodeIdentifier])
        }
      }
    } else {
      node["children"] = new Map()
    }


    if (node.parent_node != null){
      node.parent_node = this.retrieveNodeIdentifier(node.parent_node["@id"], null)  //parent node does not need information about value, should in fact be removed from tree since unnecessary
    }
    node["fc"] = fc
    node["total_children_count"] = node["hydra:totalItems"]
    node["value"] = this.decode_node_value(node["value"])
    // delete node["@graph"]
    delete node.members_metadata;
    delete node.suggestions_metadata;

    delete node["hydra:totalItems"]
    delete node["hydra:manages"]
    delete node["shacl:path"]
    return node;
  }

  encode_member(member: Member){
    return [member.contents, this.encode_tdo_value(member.representation)]
  }

  decode_member(member: any): Member{
    Object.setPrototypeOf(member, Member.prototype)
    if (member.representation !== undefined) {
      member.representation = this.decode_tdo_value(member.representation)
    }
    return member
  }

  encode_relation(relation : ChildRelation, childNodeIdentifier : Identifier){
    // TODO:: set shacl path
    return  {
      "@type" : this.relationToString(relation),
      "tree:node" : this.getNodeLocation(childNodeIdentifier.nodeId),
      "value" : childNodeIdentifier.value,
    }
  }

  decode_relation(childRelationObject : any){
    // TODO:: process shacl path
    let childRelationType = this.stringToRelation(childRelationObject["@type"].substring(5))
    let childNodeIdentifier = this.retrieveNodeIdentifier(childRelationObject["tree:node"], childRelationObject["value"]) 
    return [childRelationType, childNodeIdentifier]
  }

  private getCollectionId(){
    this.sourceDirectory + this.treeLocation + this.treeFile
  }

  getNodeLocation(nodeId: number){
    return this.sourceDirectory + this.dataFolder + "node" + nodeId.toString() + ".jsonld"
  }
  
  retrieveNodeIdentifier(str: string, value: any): Identifier{
    let nodeId = str.replace(this.sourceDirectory + this.dataFolder + "node", "").replace("/","").replace(".jsonld", "");
    if (nodeId === null) { throw new Error("requesting node with null id") }
    else { return new Identifier(parseInt(nodeId), value); }
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
}



interface EncodedFragment {
  "@context": any,
  "@id": any,
  "@type": string,
  "@graph": any,
  "hydra:view": any;

}

interface EncodedNode {
  "@id": any,
  "@type": string,
  "value": string,
  "hydra:totalItems": any;
  "parent_node" ? : any
  "children" ? : any,
  "hydra:manages" : any,
  "shacl:path" : any
}

interface ParentNode {
  fragmentId: number;
  nodeId: number;
}

interface ChildObject {
  "@id": string;
  "@type": string;
  value: any;
}