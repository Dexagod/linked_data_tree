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
    if (representation == "" || representation == null){
      return null;
    }
    return this.recursiveAddition(this.get_root_node(), member, representation)
  }

  private recursiveAddition(currentNode : Node, member : Member, searchString : string, childValue : string = "") : Node {
    if (currentNode.has_child_relations()){
      let childRelationIdentifiers = currentNode.get_children_identifiers_with_relation(ChildRelation.PrefixRelation)
      if (childRelationIdentifiers !== null) {
        for (let childIdentifier of childRelationIdentifiers.sort(function(a, b) { return b.value.length - a.value.length })){ //START SEARCHING WITH LONGEST MATCH
          if (searchString.startsWith(childIdentifier.value)){
            return this.recursiveAddition(this.get_cache().get_node(childIdentifier), member, searchString, childIdentifier.value)
          }
        }
      }
    } 
    if (member !== null) {
      currentNode.add_data(member)
      if (this.checkNodeSplit(currentNode)){
        return this.splitNode(currentNode, member.get_representation(), childValue)
      } else {
        return currentNode;
      }
    }
    return currentNode;
  }

  private splitNode(node : Node, addedString : string, childValue : string) : Node {

    let newNodeMembers = new Array<any>()
    let potentialSplitMembers = new Array();
    for (let member of node.get_members()){
      if (member.representation === childValue){
        newNodeMembers.push(member)
      } else {
        potentialSplitMembers.push(member)
      }
    }

    let childNode = null;
    if (potentialSplitMembers.length < Math.ceil(this.max_fragment_size / 100) ||  potentialSplitMembers.length < 5){
      let nodeMembers = node.get_members()
      let memberString = nodeMembers[0].representation
      childNode = new Node(memberString, node, this)

      let parentNodeList = potentialSplitMembers
      let childNodeList = []

      for (let member of newNodeMembers){
        if (parentNodeList.length < Math.floor(this.max_fragment_size / 2)){
          parentNodeList.push(member)
        } else {
          childNodeList.push(member)
        }
      }

      node.set_members(parentNodeList)
      childNode.set_members(childNodeList)
      node.add_child(ChildRelation.PrefixRelation, childNode, memberString)
      childNode.fix_total_member_count()
      node.fix_total_member_count()  
      return childNode;
    }


    let firstLettersArray = potentialSplitMembers.map(e => e.get_representation().substring(childValue.length, childValue.length + 1))
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

    let splitMembers = new Array<any>()

    for (let member of potentialSplitMembers){
      if (member.representation.substring(childValue.length, childValue.length + 1) === maxChar){
        splitMembers.push(member)
      } else {
        newNodeMembers.push(member)
      }
    }


    
    if (splitMembers.length !== 0){
      let newNodeValue = childValue + maxChar
      childNode = new Node(newNodeValue, node, this)
      node.set_members(newNodeMembers)
      childNode.set_members(splitMembers)
      node.add_child(ChildRelation.PrefixRelation, childNode, newNodeValue)
      childNode.fix_total_member_count()
      node.fix_total_member_count()  
    }
    
    if (this.checkNodeSplit(node)){
      // THERE ARE MORE THAN fragmensize AMOUNT OF ITEMS WITH THE SAME NAME
      let nodeMembers = node.get_members()
      let memberString = nodeMembers[0].representation
      childNode = new Node(memberString, node, this)

      let newMembers = nodeMembers.slice(0, Math.floor(nodeMembers.length / 2))
      let splitMembers = nodeMembers.slice(Math.floor(nodeMembers.length / 2))

      node.set_members(newMembers)
      childNode.set_members(splitMembers)
      node.add_child(ChildRelation.PrefixRelation, childNode, memberString)
      childNode.fix_total_member_count()
      node.fix_total_member_count()  
    }

    if (node.get_members().length > this.max_fragment_size){ throw new Error()}
    

    if (childNode !== null && addedString.startsWith(maxChar)){
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

