import { Tree } from './Tree';
import { Member } from '../DataObjects/Member';
import { Node } from '../Node/Node';
import { ChildRelation } from '../Relations/ChildRelation';
import { Identifier } from '../Identifier';
import { Relation } from '../Relation';
import { Interval } from '../Interval';


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
    let interval : Interval = {start: null, end: null}


    this.nodePath = []
    return this.recursiveAddition(this.get_root_node(), member, representation, interval)
  }

  nodePath : Array<Node> = new Array();
  
  private recursiveAddition(currentNode : Node, member : Member, value : any, interval : Interval) : Node {
    this.nodePath.push(currentNode)
    if (currentNode.has_child_relations()){
      let intervalMap = this.getIntervals(currentNode.getRelations()) 
      for (let entry of Array.from(intervalMap.entries())){
        let intervalStart = entry[1].start
        let intervalEnd = entry[1].end
        if ( (intervalStart === null || this.memberNameComparisonFunction(intervalStart, value) < 0 ) && (intervalEnd === null || this.memberNameComparisonFunction(value, intervalEnd) <= 0) ){ // <= for end because it is a lesser than or equal
          return this.recursiveAddition(this.get_cache().get_node_by_id(entry[0]), member, value, entry[1])
        }
      }
    } 

    if (currentNode.has_child_relations()){ 
      throw new Error("There is a gap between the nodes where a value fell through.")
    }


    if (member !== null) {
      currentNode.add_data(member)
      if (currentNode.get_members().length > this.max_fragment_size){
        return this.splitLeafNode(currentNode, interval, value)
      }
    }
    return currentNode;
  
  }

  private getIntervals(relationList: Array<Relation>) : Map<any, Interval>{
    let relationMap = new Map()
    for (let relation of relationList){
      if (relation.type === ChildRelation.LesserOrEqualThanRelation){
        this.addToIntervalMap(relationMap, relation.identifier.nodeId , null, relation.value)
      }
      if (relation.type === ChildRelation.GreaterThanRelation){
        this.addToIntervalMap(relationMap, relation.identifier.nodeId , relation.value, null)
      }
    }
    return relationMap
  }
  
  splitLeafNode(node : Node, interval : Interval, value : any) : Node{

    for (let element of node.get_members().map(e=>e.get_representation())){
      if (interval.start !== null && compare(interval.start, element) >= 0){
        throw new Error("unsanitary node1")
      }
      if (interval.end !== null && compare(interval.end, element) < 0){
        throw new Error("unsanitary node2")
      }
    }


    let membersSet = new Set<any>()
    for (let member of node.get_members().map(e => e.get_representation())){
      membersSet.add(member)
    }

    if (membersSet.size < 4) {
      // We cannot split this node, because that would give problems to the balancing; We need at least 2 different values left and right
      return node;
    }


    
    let orderedMemberNames = Array.from(membersSet).sort(this.memberNameComparisonFunction)
    let smallMemberNames = orderedMemberNames.slice(0, Math.ceil(orderedMemberNames.length / 2))
    let largeMemberNames = orderedMemberNames.slice(Math.ceil(orderedMemberNames.length / 2))
    let splitValue : any = smallMemberNames[smallMemberNames.length-1]

    let smallMembers = new Array<Member>();
    let largeMembers = new Array<Member>();
    for (let member of node.get_members()){
      if (smallMemberNames.indexOf(member.get_representation()) != -1){
        smallMembers.push(member) 
      } else if (largeMemberNames.indexOf(member.get_representation()) != -1){
        largeMembers.push(member)
      } else {
        throw new Error('member name not in list')
      }
    }

    node.deleteMembers() // SPLITVALUE is highest value for the LesserThanOrEqual relation
  
    let parent = null;
    let nodeHasParent = true;
    if (node.has_parent_node()){
      parent = node.get_parent_node()
    } else {
      nodeHasParent = false;
      node.clear()
      parent = node
    }


    let smallMembersNode = new Node(null, parent, this)
    let largeMembersNode = new Node(null, parent, this)

    smallMembersNode.set_members(smallMembers)
    largeMembersNode.set_members(largeMembers)

    let relationList = new Array();
    let newChildrenList = new Array();

    if (interval.start !== null){
      relationList.push( this.createRelation(ChildRelation.GreaterThanRelation, interval.start, smallMembersNode.get_identifier()) )
      newChildrenList.push(smallMembersNode)
    }

    relationList.push( this.createRelation(ChildRelation.LesserOrEqualThanRelation, splitValue, smallMembersNode.get_identifier()) )
    newChildrenList.push(smallMembersNode)
    
    relationList.push( this.createRelation(ChildRelation.GreaterThanRelation, splitValue, largeMembersNode.get_identifier()) )
    newChildrenList.push(largeMembersNode)
    
    if (interval.end !== null){
      relationList.push( this.createRelation(ChildRelation.LesserOrEqualThanRelation, interval.end, largeMembersNode.get_identifier()) )
      newChildrenList.push(largeMembersNode)
    }

    smallMembersNode.fix_total_member_count()
    largeMembersNode.fix_total_member_count()

    this.checkRelationsMinMax(parent)
    
    if (nodeHasParent) {
      parent.swapChildrenWithRelation(node, relationList, newChildrenList)
      parent.fix_total_member_count()
      this.get_cache().delete_node(node) // delete fragment cause we will only accept one node per fragment
    } else {
      for (let i = 0; i < relationList.length; i++){
        node.add_child_no_propagation_with_relation(relationList[i], newChildrenList[i])
      }
      this.set_root_node_identifier(node.get_identifier())
      node.fix_total_member_count()
    }

    if (parent.getRelations().length > this.max_fragment_size){
      this.splitInternalNode(parent, value)
    }

    if (value <= splitValue){
      return smallMembersNode;
    } else {
      return largeMembersNode;
    }
  }

  splitInternalNode(node : Node, value : any){
    // splitting an internal node

    let [start, end] = this.checkRelationsMinMax(node)

    let intervalMap = this.getIntervals(node.getRelations())

    let smallChildrenNodeEntries = Array.from(intervalMap.entries()).sort(this.comparisonFunction)
    let largeChildrenNodeEntries = smallChildrenNodeEntries.splice(Math.ceil(smallChildrenNodeEntries.length / 2))
    let splitValue = smallChildrenNodeEntries[smallChildrenNodeEntries.length - 1][1].end

    let parent = null;
    let nodeHasParent = true;
    if (node.has_parent_node()){
      parent = node.get_parent_node()
    } else {
      nodeHasParent = false;
      node.clear()
      parent = node
    }


    let smallChildrenNode = new Node(null, parent, this)
    let largeChildrenNode = new Node(null, parent, this)

    for (let entry of smallChildrenNodeEntries){
      let entryIdentifier = new Identifier(entry[0], null)
      let entryStart = entry[1].start
      let entryEnd = entry[1].end
      if (entryIdentifier === null || entryIdentifier === undefined || entryIdentifier.nodeId === null || entryIdentifier.nodeId === undefined ) { throw new Error(" undefined entry identifier ")}

      if (entryStart !== null){
        let smallChildGTRelation = new Relation(ChildRelation.GreaterThanRelation, entryStart, entryIdentifier)
        smallChildrenNode.add_child_with_relation(smallChildGTRelation, this.cache.get_node(entryIdentifier))
      } if (entryEnd !== null){
        let smallChildLTERelation = new Relation(ChildRelation.LesserOrEqualThanRelation, entryEnd, entryIdentifier)
        smallChildrenNode.add_child_with_relation(smallChildLTERelation, this.cache.get_node(entryIdentifier))
      } else {
        throw new Error("Impossible internal tree state")
      } 
    }

    for (let entry of largeChildrenNodeEntries){
      let entryIdentifier = new Identifier(entry[0], null)
      let entryStart = entry[1].start
      let entryEnd = entry[1].end
      if (entryIdentifier === null || entryIdentifier === undefined || entryIdentifier.nodeId === null || entryIdentifier.nodeId === undefined ) { throw new Error(" undefined entry identifier ")}

      if (entryStart !== null){
        let largeChildGTRelation = new Relation(ChildRelation.GreaterThanRelation, entryStart, entryIdentifier)
        largeChildrenNode.add_child_with_relation(largeChildGTRelation, this.cache.get_node(entryIdentifier))
      } else {
        throw new Error("this should not happen 4")
      } 
      if (entryEnd !== null){
        let largeChildLTERelation = new Relation(ChildRelation.LesserOrEqualThanRelation, entryEnd, entryIdentifier)
        largeChildrenNode.add_child_with_relation(largeChildLTERelation, this.cache.get_node(entryIdentifier))
      }
    }

    smallChildrenNode.fix_total_member_count()
    largeChildrenNode.fix_total_member_count()


    if (nodeHasParent) {
      parent = this.swapNodeChildWithNewChildren(parent, node, smallChildrenNode, largeChildrenNode, splitValue)
      parent.fix_total_member_count()
      this.get_cache().delete_node(node) // delete fragment cause we will only accept one node per fragment
    } else {
      let smallChildRelation = this.createRelation(ChildRelation.LesserOrEqualThanRelation, splitValue, smallChildrenNode.get_identifier())
      let largeChildRelation = this.createRelation(ChildRelation.GreaterThanRelation, splitValue, largeChildrenNode.get_identifier())
      node.add_child_with_relation(smallChildRelation, smallChildrenNode)
      node.add_child_with_relation(largeChildRelation, largeChildrenNode)
      this.set_root_node_identifier(node.get_identifier())
      node.fix_total_member_count()
    }

    if (parent.getRelations().length >= this.max_fragment_size){
      this.splitInternalNode(parent, value)
    }


    let [smallstart, smallend] = this.checkRelationsMinMax(smallChildrenNode)
    let [largestart, largeend] = this.checkRelationsMinMax(largeChildrenNode)

    if (smallend !== largestart){
      throw new Error("SPLIT NDOE WRONG MIDDLE")
    }
    if (smallstart !== start || largeend !== end){
      throw new Error("SPLIT NODE WRONG EDGES")
    }
    this.checkRelationsMinMax(parent)
    
    return node;

  }
  
  
  swapNodeChildWithNewChildren(parent: Node, oldNode: Node, smallChildrenNode : Node, largeChildrenNode : Node, splitValue : number){
    let childRelations = parent.children;
    let oldNodeLTERelation = null;
    let oldNodeGTRelation = null;

    let newRelations = new Array();

    if (splitValue === null || splitValue === undefined){
      throw new Error("Null value split on node swap.")
    }

    for (let relation of childRelations){
      if (relation.identifier.nodeId === oldNode.get_node_id()){
        if (relation.type === ChildRelation.LesserOrEqualThanRelation){
          oldNodeLTERelation = relation
        } else if (relation.type === ChildRelation.GreaterThanRelation){
          oldNodeGTRelation = relation
        } else {
          newRelations.push(relation)
        }
      } else {
        newRelations.push(relation)
      }
    }

    if (oldNodeGTRelation !== null && oldNodeGTRelation !== undefined && (oldNodeGTRelation.value === null || oldNodeGTRelation.value === undefined)){
      throw new Error("Impossible relation value 1")
    }

    if (oldNodeLTERelation !== null && oldNodeLTERelation !== undefined && (oldNodeLTERelation.value === null || oldNodeLTERelation.value === undefined)){
      throw new Error("Impossible relation value 1")
    }
    
    if (oldNodeGTRelation !== null && oldNodeGTRelation !== undefined){
      newRelations.push(this.createRelation(ChildRelation.GreaterThanRelation, oldNodeGTRelation.value, smallChildrenNode.get_identifier()))
    }
    newRelations.push(this.createRelation(ChildRelation.LesserOrEqualThanRelation, splitValue, smallChildrenNode.get_identifier()))
    newRelations.push(this.createRelation(ChildRelation.GreaterThanRelation, splitValue, largeChildrenNode.get_identifier()))

    if (oldNodeLTERelation !== null && oldNodeLTERelation !== undefined){
      newRelations.push(this.createRelation(ChildRelation.LesserOrEqualThanRelation, oldNodeLTERelation.value, largeChildrenNode.get_identifier()))
    }

    parent.children = newRelations;
    return parent;
  }

  private addToIntervalMap(map : Map<any, Interval>, id : any, start : any, end : any) {
    if (! map.has(id)){
      let interval : Interval = { start : null , end : null } 
      map.set(id, interval)
    } 
    let updatedInterval = map.get(id)
    if (updatedInterval === undefined){ updatedInterval = { start: null , end: null } }
    updatedInterval.start = (start !== null && start !== undefined) ? start : updatedInterval.start
    updatedInterval.end = (end !== null && end !== undefined) ? end : updatedInterval.end
    map.set(id, updatedInterval)
  }

  private createRelation(childRelation : ChildRelation, value : any, identifier: Identifier) : Relation{
    if (value === null || value === undefined || value === NaN) { throw new Error("Zero value on Relation creation")}
    if (identifier === null || identifier === undefined || identifier.nodeId === null || identifier.nodeId === undefined) { throw new Error("Zero identifier on Relation creation")}
    return new Relation(childRelation, value, identifier)
  }

  private checkRelationsMinMax(node : Node){
    let intervals = this.getIntervals(node.getRelations())
    if (intervals.size === 0){ return []}
    let sortedIntervals = Array.from(intervals.entries()).sort(this.comparisonFunction)
    for (let i = 0; i < (sortedIntervals.length - 1); i++) {
      if(sortedIntervals[i] === undefined || sortedIntervals[i+1] === undefined || sortedIntervals[i][1].end !== sortedIntervals[i+1][1].start){
        throw new Error("node relations are not filling the whole namespace")
      }
    }
    return([sortedIntervals[0][1].start, sortedIntervals[sortedIntervals.length-1][1].end])
  }

  private comparisonFunction(a : [any, Interval], b : [any, Interval]) { 
    if (a[1].start === null) {return -1}; 
    if (b[1].start === null) {return 1}; 
    if (typeof a[1].start === "string"){ return compare(a[1].start, b[1].start) }
    return a[1].start - b[1].start
  }

  private memberNameComparisonFunction(a : any, b : any) { 
    if (typeof a === "string"){ return compare(a, b) }
    return a - b
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
    let returnNodes = new Array<Node>();
    let addedNodes = new Set<string>();
    for (let node of nodes){
      for (let member of node.get_members()){
        if (member.get_representation() === value){
          if (! addedNodes.has(node.get_node_id())){
            returnNodes.push(node)
            addedNodes.add(node.get_node_id())
          }
          break;
        }
      }  
    }
    return returnNodes
  }

  private _search_data_recursive(currentNode : Node, searchValue : string) : [Array<Member>, Array<Node>]{
    let resultingMembers = new Array();
    let resultingNodes :  Array<Node> = new Array();
    for (let member of currentNode.get_members()){
      if (member.get_representation() === searchValue){
        resultingMembers.push(member)
        resultingNodes.push(currentNode)
      }
    }
    if (currentNode.has_child_relations()){
      let intervalMap = this.getIntervals(currentNode.getRelations()) 
      for (let entry of Array.from(intervalMap.entries())){
        let intervalStart = entry[1].start
        let intervalEnd = entry[1].end
        if ( (intervalStart === null || this.memberNameComparisonFunction(intervalStart, searchValue) < 0 ) && (intervalEnd === null || this.memberNameComparisonFunction(searchValue, intervalEnd) <= 0) ){ // <= for end because it is a lesser than or equal
          let [resMems, resNodes] = this._search_data_recursive(this.get_cache().get_node_by_id(entry[0]), searchValue)
          resultingMembers = resultingMembers.concat(resMems)
          resultingNodes = resultingNodes.concat(resNodes)
        }
      }
    } 
    return [resultingMembers, resultingNodes]
  }

}


function compare(a : any, b : any){
  if (typeof a === 'string' && typeof b === 'string'){
    return a.localeCompare(b)
  } else {
    return a - b
  }
}
  



