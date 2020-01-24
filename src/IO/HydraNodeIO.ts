import { Member } from "../DataObjects/Member";
import { Node } from "../Node/Node";
import { ChildRelation } from '../Relations/ChildRelation';
import { Cache } from "../Cache/Cache";
import { Identifier } from '../Identifier';
import { Tree } from '../Tree/Tree';
import { Relation } from '../Relation';
import { NodeIO } from './NodeIO';

import fs = require('fs');
var jsonld = require('jsonld')

var context = {
  "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
  "rdfs":  "http://www.w3.org/2000/01/rdf-schema#",
  "foaf": "http://xmlns.com/foaf/0.1/",
  "hydra": "http://www.w3.org/ns/hydra/core#",
  "tree": "https://w3id.org/tree#",
  "schema": "http://schema.org//",
  "value": "tree:value",
  "members": "hydra:member",
  "children": "tree:relation",
  "geo" : "http://www.w3.org/2003/01/geo/wgs84_pos#",
  "shacl" : "http://www.w3.org/ns/shacl#"
}

export class HydraNodeIO extends NodeIO{

  /**
   * Initialize the fragment IO managing object.
   * @param {string} sourceDirectory - The source directory where all data of this tree is stored.
   * @param {string} dataFolder - The subfolder of the source directory where the fragments are stored.
   */



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

  writeTreeRoot(node : Node, tree: Tree){
    let location = this.getNodeLocation(node.get_node_id())
    let [encodedNode, encodedMembers, encodedMemberMetadata] = this.encode_node(node)
    let wrapper : any = this.encode_wrapper(encodedNode, encodedMembers, encodedMemberMetadata, node.get_remainingItems()) // TODO:: fix for correct amount of total items?
    let treeMetadata = [tree.max_fragment_size, tree.node_count, tree.options]  
    wrapper["treeMetadata"] = treeMetadata
    let JSONSTRING = JSON.stringify(wrapper, function(key, value) {
        return (key == 'fc') ? undefined : value;
    });
    fs.writeFileSync(location, JSONSTRING, {encoding: 'utf-8'})  
    let returnwrapper = Object.assign(wrapper)
    delete returnwrapper["treeMetadata"]
    delete returnwrapper["memberMetadata"]
    delete returnwrapper["hydra:member"]
    return wrapper
  }

  readTree(prototypeObject : any) {
    let nodeId = this.dataFolder + "node0.jsonld";
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
  
  decode_wrapper(wrapper : any){
    let node = wrapper["hydra:view"]
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

    // let relationList = []
    // for (let relation of node.get_children()){
    //   relationList.push(this.encode_relation(relation))
    // }
    
    let writtenNode: any = {
      "@id": this.getNodeIdFromIdentifier( node.get_node_id()),
      "@type": "hydra:PartialCollectionView",
      "metadataValue" : this.encode_node_value(node.get_identifier().value),
      "hydra:first":  "/" + this.dataFolder + "node0.jsonld",
    };

    if (node.has_parent_node()){
      writtenNode["hydra:previous"] = node.get_parent_node().get_node_id()
    }

    if (node.get_children().length === 1){
      writtenNode["hydra:next"] = this.getNodeIdFromIdentifier(node.get_children()[0].identifier.nodeId)
    } else if(node.get_children_objects().length !== 0){
      throw new Error('node more that 1 child.')
    }
    
    // if (relationList.length !== 0){
    //   writtenNode["children"] = relationList
    // }

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
    node["value"] = this.decode_node_value(node["metadataValue"])
    node["identifier"] = this.retrieveNodeIdentifier(node["@id"], node["value"]) // node["@id"].replace(this.dataFolder + "fragment", "").replace(".jsonld", "").split("#")

    delete node["@id"];
    delete node["@type"];

    let member_list = [];
    for (var j = 0; j < members.length; j++){
      let member = this.decode_member(members[j])
      member.representation = membersMetadata[j]
      member_list.push(member)
    }
    node["members"] = member_list

    
    node["children"] = new Array()
    if (node.hasOwnProperty("hydra:next")){
      let relation = new Relation(ChildRelation.EqualThanRelation, null, this.retrieveNodeIdentifier(node["hydra:next"], null), null)
      node["children"].push(relation)
    }
    



    if (node.parent_node != null){
      node.parent_node = this.retrieveNodeIdentifier(node.parent_node["@id"], null)  //parent node does not need information about value, should in fact be removed from tree since unnecessary
    }
    node["fc"] = fc
    node["remainingItems"] = 0

    
    // delete node["@graph"]
    delete node.members_metadata;
    delete node["metadataValue"]
    delete node["tree:remainingItems"]
    delete node["hydra:next"]
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

  encode_relation(relation : Relation){
    // TODO:: set shacl path
    if (relation.path === null){
      relation.path = this.shaclPath;
    }
    return  {
      "@type" : this.relationToString(relation.type),
      "tree:node" : { "@id": this.getNodeIdFromIdentifier(relation.identifier.nodeId) },
      "shacl:path" : relation.path,
      "value" : this.encode_node_value(relation.value),
    }
  }

  decode_relation(childRelationObject : any){
    // TODO:: process shacl path
    let relationType = this.stringToRelation(childRelationObject["@type"].substring(5))
    let relationIdentifier = this.retrieveNodeIdentifier(childRelationObject["tree:node"]["@id"], this.decode_node_value(childRelationObject["value"]))
    let relationValue = this.decode_node_value(childRelationObject["value"])
    let shaclPath = childRelationObject["shacl:path"]
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
    // return this.sourceDirectory + this.dataFolder + "node" + nodeId.toString() + ".jsonld"
    // return this.dataFolder + "node" + nodeId.toString() + ".jsonld"
  }
  
  getNodeIdFromIdentifier(nodeId: string){
    return nodeId
    // return "/" + this.dataFolder + "node" + nodeId.toString() + ".jsonld"
  }
  
  retrieveNodeIdentifier(str: string, value: any): Identifier{
    // let nodeId = str.replace(this.sourceDirectory + this.dataFolder + "node", "").replace("/","").replace(".jsonld", "");
    let nodeId = str //str.replace(this.dataFolder + "node", "").replace("/","").replace(".jsonld", "");
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
  "tree:remainingItems": any;
  "parent_node" ? : any
  "children" ? : any,
  "metadataValue": any
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