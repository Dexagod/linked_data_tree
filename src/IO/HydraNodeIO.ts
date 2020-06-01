import { Member } from "../DataObjects/Member";
import { Node } from "../Node/Node";
import { ChildRelation } from '../Relations/ChildRelation';
import { Cache } from "../Cache/Cache";
import { Identifier } from '../Identifier';
import { Tree } from '../Tree/Tree';
import { Relation } from '../Relation';
import { NodeIO } from './NodeIO';

import fs = require('fs');

export class HydraNodeIO extends NodeIO{

  

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
    node["identifier"] = this.retrieveNodeIdentifier(node["@id"], null) 
    node["@id"].replace(this.dataFolder + "fragment", "").replace(".jsonld", "").split("#")

    delete node["@id"];
    delete node["@type"];

    let member_list = [];
    for (var j = 0; j < members.length; j++){
      let member = this.decode_member(members[j], membersMetadata[j])
      member_list.push(member)
    }
    node["members"] = member_list

    
    node["children"] = new Array()
    if (node.hasOwnProperty("hydra:next")){
      let relation = new Relation(ChildRelation.EqualThanRelation, null, this.retrieveNodeIdentifier(node["hydra:next"], null))
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