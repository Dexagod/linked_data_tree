import { Tree } from './Tree';
import { Member } from '../DataObjects/Member';
import { Node } from '../Node/Node';
import { ChildRelation } from '../Relations/ChildRelation';
import { Identifier } from '../Identifier';


export class BinaryBTree extends Tree {

  /**
   * Adds the given data to the tree.
   * @param {Member} member 
   */
  addData(representation : any, member : Member) : Node | null{
    if(this.node_count === 0) {
      this.createFirstNode("", null)
    }
    // Check for invalid object.
    // Object must have a representation.
    if (representation == "" || representation == null){
      return null;
    }
    return this.recursiveAddition(this.get_root_node(), member, representation, null)
  }
  
  private recursiveAddition(currentNode : Node, member : Member, value : any, nodeWithSpace : Node | null) : Node {
    if (currentNode.has_child_relations()){

      let intervalMap = this.getIntervals(this.getList(currentNode.get_children_identifiers_with_relation(ChildRelation.LesserOrEqualThanRelation)), 
                                        this.getList(currentNode.get_children_identifiers_with_relation(ChildRelation.GreaterThanRelation)))
      for (let childId of Array.from(intervalMap.keys())){
        if (intervalMap.get(childId).start < value < intervalMap.get(childId).end){
          recursiveAddition(this.get_cache().get_node_by_id(childId))
        }
      }
    } 
  }

  private getIntervals(lesserThanOrEqualRelationIdentifiers : Array<Identifier>, greaterThanRelationIdentifiers : Array<Identifier>){
    let relationMap = new Map()
    for (let childIdentifier of lesserThanOrEqualRelationIdentifiers){
      this.addToIntervalMap(relationMap, childIdentifier.nodeId , null, childIdentifier.value)
    }
    for (let childIdentifier of greaterThanRelationIdentifiers){
      this.addToIntervalMap(relationMap, childIdentifier.nodeId , childIdentifier.value, null)
    }
    return relationMap
  }

  private getList(list : Array<any> | null) : Array<any> {
    if (list === null){
      return []
    } return list;
  }

  private splitNode(node : Node, addedString : string, currentNodePathString : string) : Node {
    
  }

  /**
  * The given dataobject is searched in the tree.
  * For testing and debugging purposes.
  * @param {DataObject} searched_member 
  */
  searchData(value : any): Member[] {
    return this._search_data_recursive(this.get_root_node(), value)
  }
  
  private _search_data_recursive(currentNode : Node, searchString : string) : Array<Member>{
    throw new Error("MethodNotYetImplemented")
  }



  private addToIntervalMap(map : Map<any, any>, id : any, start : any, end : any) {
    if (! map.has(id)){
      let interval : Interval = { start : -Infinity , end : Infinity } 
      map.set(id, interval)
    } 
    let updatedInterval = map.get(id)
    updatedInterval.start = (start !== null && start !== undefined) ? start : updatedInterval.start
    updatedInterval.end = (end !== null && end !== undefined) ? end : updatedInterval.end
    map.set(id, updatedInterval)
  }
}
  

interface Interval {
  start : any;
  end : any;
}
  
    


