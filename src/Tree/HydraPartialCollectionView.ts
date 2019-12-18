import { Tree } from './Tree';
import { Member } from '../DataObjects/Member';
import { Node } from '../Node/Node';
import { ChildRelation } from '../Relations/ChildRelation';

// const normalizeString = require('stringnormalizer');

export class HydraPartialCollectionView extends Tree {
  /**
  * Adds the given data to the tree.
  * @param {Member} member 
  */
  addData(representation : any, member : Member) : Node | null{
    if(this.node_count === 0) {
      this.createFirstNode("", null)
    }
    if (representation === "" || representation === null || member === null){
      return null;
    }
    return this.recursiveAddition(this.get_root_node(), member)
  }

  private recursiveAddition(currentNode : Node, member : Member) : Node {
    if (currentNode.get_members().length <= this.max_fragment_size) {
      currentNode.add_data(member)
      return currentNode;
    }
    let childNodes = currentNode.get_children_objects();
    if (childNodes.length > 1) { throw new Error("Trying to make a list with more that a single relation per node")}
    if (childNodes.length === 1) {
      return this.recursiveAddition(childNodes[0], member)
    } else {
      return this.extendList(currentNode, member)
    }
  }

  private extendList(parentNode : Node, member: Member) : Node {
    let childNode = new Node(null, parentNode, this)
    parentNode.add_child(ChildRelation.EqualThanRelation, childNode, null)
    childNode.add_data(member);
    return childNode;
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
    return this._search_data_recursive(this.get_root_node(), value)[1]
  }

  private _search_data_recursive(currentNode : Node, searchString : string) : [Array<Member>, Array<Node>]{
    let resultingMembers :  Array<Member> = new Array();
    let resultingNodes :  Array<Node> = new Array();
    let found = false;
    for (let member of currentNode.get_members()){
      if (member.get_representation() === searchString ){
        resultingMembers.push(member)
        found = true;
      }
    }
    if (found){
      resultingNodes.push(currentNode)
    }
    let children = currentNode.get_children_objects();
    if (children.length === 1){
      let [queryResultingMembers, queryResultingNodes] = this._search_data_recursive(children[0], searchString)
      resultingMembers = resultingMembers.concat(queryResultingMembers)
      resultingNodes = resultingNodes.concat(queryResultingNodes)
    } 
    return [resultingMembers, resultingNodes]
  }
}

