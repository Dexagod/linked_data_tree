import { Tree } from './Tree';
import { Member } from '../DataObjects/Member';
import { Node } from '../Node/Node';
import { ChildRelation } from '../Relations/ChildRelation';

// const normalizeString = require('stringnormalizer');

export class PrefixTree extends Tree {
  /**
  * Adds the given data to the tree.
  * @param {Member} member 
  */
  addData(representation : any, member : Member) : Node | null{
    if(this.node_count === 0) {
      this.createFirstNode("", null)
    }
    let repr = representation
    // Check for invalid object.
    // Object must have a representation.
    if (repr == "" || repr == null){
      return null;
    }
    return this.recursiveAddition(this.get_root_node(), member, representation)
  }

  private recursiveAddition(currentNode : Node, member : Member, searchString : string, childValue : string = "") : Node {
    if (currentNode.has_child_relations()){
      let childRelationIdentifiers = currentNode.get_children_identifiers_with_relation(ChildRelation.PrefixRelation)
      if (childRelationIdentifiers !== null) {
        for (let childIdentifier of childRelationIdentifiers){
          if (searchString.startsWith(childIdentifier.value)){
            return this.recursiveAddition(this.get_cache().get_node(childIdentifier), member, searchString, childIdentifier.value)
          }
        }
      }
    } 
    if (member !== null) {
      currentNode.add_data(member)
      if (currentNode.get_members().length <= this.max_fragment_size) {
        return currentNode;
      } else {
        return this.splitNode(currentNode, member.get_representation(), childValue)
      }
    }
    return currentNode;
  }

  private splitNode(node : Node, addedString : string, childValue : string) : Node {
    let nodeMembers = node.get_members()


    let firstLettersArray = nodeMembers.map(e => e.get_representation().substring(childValue.length, childValue.length + 1))
    const frequencyMap : Map<any, any> = firstLettersArray.reduce((acc, e) => acc.set(e, (acc.get(e) || 0) + 1), new Map())

    // console.log(currentNodePathString, currentNodePathString.length, frequencyMap, nodeMembers.map(e => [e.get_representation().substring(currentNodePathString.length, currentNodePathString.length + 1), this.getNormalizedString(e.get_representation()), e.get_representation()]))
    let maxFreq = 0
    let maxChar = null
    for (let item of Array.from(frequencyMap.entries())) {
      if (item[1] > maxFreq){
        maxChar = item[0]
        maxFreq = item[1]
      }
    }
    if (maxChar === null) { throw new Error("Something went wrong internally while building the tree. Could not split an internal node on overflow.")}

    let newNodeMembers = new Array<any>()
    let splitMembers = new Array<any>()

    for (let member of nodeMembers){
      if (member.representation.substring(childValue.length, childValue.length + 1) === maxChar){
        splitMembers.push(member)
      } else {
        newNodeMembers.push(member)
      }
    }

    node.set_members(newNodeMembers)

    let newNodeValue = childValue + maxChar
    let childNode = new Node(newNodeValue, node, this)
    childNode.set_members(splitMembers)
    node.add_child(ChildRelation.PrefixRelation, childNode, newNodeValue)

    childNode.fix_total_member_count()
    node.fix_total_member_count()

    if (addedString.startsWith(maxChar)){
      return childNode
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
    if (childrenIdentifiers !== null && childrenIdentifiers.length > 0) {
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
    } 
    resultingMembers = resultingMembers.concat(currentNode.get_members())
    resultingNodes.push(currentNode)
    return [resultingMembers, resultingNodes]
  }
   
}

