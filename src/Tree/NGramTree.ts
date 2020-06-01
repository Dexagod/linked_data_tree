import { Tree } from './Tree';
import { Member } from '../DataObjects/Member';
import { Node } from '../Node/Node';
import { ChildRelation } from '../Relations/ChildRelation';
import { Relation } from '../Relation';
import { Identifier } from '../Identifier';


export class NGramTree extends Tree {
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
    let node = null;
    for (let suffix of this.getSuffixes(representation)){

      const suffixContents  : any = Object.assign({}, member.contents);
      suffixContents.suffix = suffix

      const suffixMember = new Member(suffix, suffixContents)

      node = this.recursiveAddition(this.get_root_node(), suffixMember,  suffix) 
    }
    return node
  }

  private recursiveAddition(currentNode : Node, member : Member, searchString : string, childValue : string = "", level: number = 0) : Node {
    let isRoot = false;
    let identifier = this.get_root_node_identifier()
    isRoot = !!identifier && identifier.nodeId === currentNode.get_node_id();
    let increase = isRoot ? 2 : 1;
    if (currentNode.has_child_relations()){
      if (searchString === childValue){
        for (let childIdentifier of currentNode.get_children_identifiers_with_relation(ChildRelation.EqualThanRelation)){
          if (searchString === childIdentifier.value){
            return this.recursiveAddition(this.get_cache().get_node(childIdentifier), member, searchString, childIdentifier.value, level+increase)
          }
        }
      }
      for (let childIdentifier of currentNode.get_children_identifiers_with_relation(ChildRelation.SubstringRelation)){
        if (searchString.startsWith(childIdentifier.value)){
          return this.recursiveAddition(this.get_cache().get_node(childIdentifier), member, searchString, childIdentifier.value, level+increase)
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
    let isRoot = false;
    let identifier = this.get_root_node_identifier()
    isRoot = !!identifier && identifier.nodeId === node.get_node_id();
  
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

    const splitStrLen = isRoot ? 2 : 1; // In the root we want to split on the two

    for (let member of node.get_members()){
      let nextChar = member.get_representation().substring(level, level + splitStrLen) // level + 1 because we split the first node on length 2 instead of 1
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
    let relation = ChildRelation.SubstringRelation
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
      this.splitNode(childNode, newValue, level+splitStrLen)
    }
    return node;
  }

  getSuffixes(representation: string) : string[] {
    let suffixes = [];
    if(representation.length < 3) return [representation]
    for (let i = 0; i < representation.length - 2; i++) {
      let suffix = representation.substring(i, representation.length)
      var suffixCopy = (' ' + suffix).slice(1);
      suffixes.push(suffixCopy)
    }
    return suffixes
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
    let childrenIdentifiers = currentNode.get_children_identifiers_with_relation(ChildRelation.SubstringRelation)
    let childrenIdentifiersEqual = currentNode.get_children_identifiers_with_relation(ChildRelation.EqualThanRelation)

    for (let childIdentifier of childrenIdentifiers){
      if (searchString.startsWith(childIdentifier.value)){

        let child = this.get_cache().get_node(childIdentifier)
        let [resMems, resNodes] = this._search_data_recursive(child, searchString)
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

