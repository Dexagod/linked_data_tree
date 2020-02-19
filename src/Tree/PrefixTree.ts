import { Tree } from './Tree';
import { Member } from '../DataObjects/Member';
import { Node } from '../Node/Node';
import { ChildRelation } from '../Relations/ChildRelation';
import { Relation } from '../Relation';


export class PrefixTree extends Tree {
  /**
  * Adds the given data to the tree.
  * @param {Member} member 
  */

  count = 0
  addData(representation : any, member : Member) : Node | null{

    if(this.node_count === 0) {
      this.createFirstNode("", null)
    }
    if (representation == "" || representation == null){
      return null;
    }
    return this.recursiveAddition(this.get_root_node(), member, representation)
  }

  private recursiveAddition(currentNode : Node, member : Member, searchString : string, childValue : string = "", level: number = 0) : Node {
    if (currentNode.has_child_relations()){
      if (searchString === childValue){
        for (let childIdentifier of currentNode.get_children_identifiers_with_relation(ChildRelation.EqualThanRelation)){
          if (searchString === childIdentifier.value){
            return this.recursiveAddition(this.get_cache().get_node(childIdentifier), member, searchString, childIdentifier.value, level+1)
          }
        }
      }
      for (let childIdentifier of currentNode.get_children_identifiers_with_relation(ChildRelation.PrefixRelation)){
        if (searchString.startsWith(childIdentifier.value)){
          return this.recursiveAddition(this.get_cache().get_node(childIdentifier), member, searchString, childIdentifier.value, level+1)
        }
      }
    } 
    if (member !== null) {
      currentNode.add_data(member)
      if (this.checkNodeSplit(currentNode)){
        return this.splitNode(currentNode, childValue, level)
      } else {
        return currentNode;
      }
    }
    return currentNode;
  }

  private splitNode(node : Node, childValue : string, level: number) : Node {
  
    if (level > childValue.length){
      // splitting a node behind an equalsrelation
      let childNode = new Node(childValue, null, this)
      let nodeMembers = node.get_members()
      let splitMember = nodeMembers.pop()
      node.members = nodeMembers
      if (splitMember === undefined){ throw new Error("Undefined split member")}
      childNode.add_data(splitMember)
      node.add_child_no_propagation(ChildRelation.EqualThanRelation, childNode, childValue)
      
      return childNode;
    }

    let characterMap = new Map()

    for (let member of node.get_members()){
      let nextChar = member.get_representation().substring(level, level+1)
      let charArray = characterMap.get(nextChar)
      if (charArray === undefined){ 
        characterMap.set(nextChar, [member])
      } else {
        charArray.push(member)
      }
    }

    let maxCharacter = "";
    let maxcharacterListSize = 0;

    for (let entry of Array.from(characterMap.entries())){
      if (entry[1].length > maxcharacterListSize){
        maxcharacterListSize = entry[1].length
        maxCharacter = entry[0]
      }
    }
    let maxCharMembersList = new Array()
    let currentNodeMembersList = new Array()

    for (let entry of Array.from(characterMap.entries())){
      if (entry[0] === maxCharacter){
        maxCharMembersList = entry[1]
      } else {
        currentNodeMembersList = currentNodeMembersList.concat(entry[1])
      }
    }

    let newValue = childValue + maxCharacter
    let relation = ChildRelation.PrefixRelation
    if (maxCharacter === ""){
      relation = ChildRelation.EqualThanRelation
    }

    let childNode = new Node(newValue, null, this)
    for (let member of maxCharMembersList){
      childNode.add_data(member)
    }
    node.set_members(currentNodeMembersList)
    node.add_child_no_propagation(relation, childNode, newValue)

    if (this.checkNodeSplit(childNode)){
      this.splitNode(childNode, newValue, level+1)
    }
    return node;
  }
  
  /**
  * The given dataobject is searched in the tree.
  * For testing and debugging purposes.
  * @param {DataObject} searched_member 
  */
  
  searchData(value : any): Member[] {
    return this._search_data_recursive(this.get_root_node(), value)[0]
  }

  searchNode(value : any): Node[] {
    let nodes = this._search_data_recursive(this.get_root_node(), value)[1]
    let returnNodes = Array<Node>();
    for (let node of nodes){
      for (let member of node.get_members()){
        if (member.get_representation() === value){
          returnNodes.push(node)
          break;
        }
      }  
    }
    return returnNodes
  }

  private _search_data_recursive(currentNode : Node, searchString : string) : [Array<Member>, Array<Node>]{
    let resultingMembers :  Array<Member> = new Array();
    let resultingNodes :  Array<Node> = new Array();
    let childrenIdentifiers = currentNode.get_children_identifiers_with_relation(ChildRelation.PrefixRelation)
    let childrenIdentifiersEqual = currentNode.get_children_identifiers_with_relation(ChildRelation.EqualThanRelation)

    for (let childIdentifier of childrenIdentifiers){
      if (searchString.startsWith(childIdentifier.value)){

        let child = this.get_cache().get_node(childIdentifier)
        let [resMems, resNodes] = this._search_data_recursive(child, searchString)
        resultingMembers = resultingMembers.concat(resMems)
        resultingNodes = resultingNodes.concat(resNodes)

      } else if (childIdentifier.value.startsWith(searchString)){

        let child = this.get_cache().get_node(childIdentifier)
        let [resMems, resNodes] = this._search_data_recursive(child, "")
        resultingMembers = resultingMembers.concat(resMems)
        resultingNodes = resultingNodes.concat(resNodes)
      }
    }

    for (let childIdentifier of childrenIdentifiersEqual){
      if (searchString === childIdentifier.value){
        let child = this.get_cache().get_node(childIdentifier)
        let [resMems, resNodes] = this._search_data_recursive(child, searchString)
        resultingMembers = resultingMembers.concat(resMems)
        resultingNodes = resultingNodes.concat(resNodes)
      }
    }



    resultingMembers = resultingMembers.concat(currentNode.get_members())
    resultingNodes.push(currentNode)
    return [resultingMembers, resultingNodes]
  }
   
}

