import { Tree } from './Tree';
import { Member } from '../DataObjects/Member';
import { Node } from '../Node/Node';
import { ChildRelation } from '../Relations/ChildRelation';
import { Identifier } from '../Identifier';
import { Relation } from '../Relation';
import { Interval } from '../Interval';


export class BinaryBTree extends Tree {

  maxMembersInnerNodes:number = this.max_fragment_size / 2
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
      if (relation.type === ChildRelation.LesserThanRelation){
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

    let splitIndex = Math.floor(orderedMemberNames.length / 2)
    let splitValue : any = orderedMemberNames[splitIndex]

    let smallMembers = new Array<Member>();
    let largeMembers = new Array<Member>();
    let splitMembers = new Array<Member>();

    for (let member of node.get_members()){
      if (this.memberNameComparisonFunction(splitValue, member.get_representation()) > 0){
        smallMembers.push(member) 
      } else if (this.memberNameComparisonFunction(splitValue, member.get_representation()) < 0){
        largeMembers.push(member)
      } else {
        splitMembers.push(member);
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

    relationList.push( this.createRelation(ChildRelation.LesserThanRelation, splitValue, smallMembersNode.get_identifier()) )
    newChildrenList.push(smallMembersNode)
    
    relationList.push( this.createRelation(ChildRelation.GreaterThanRelation, splitValue, largeMembersNode.get_identifier()) )
    newChildrenList.push(largeMembersNode)
    
    if (interval.end !== null){
      relationList.push( this.createRelation(ChildRelation.LesserThanRelation, interval.end, largeMembersNode.get_identifier()) )
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

    if (splitMembers.length === 0) { throw new Error("Splitting member in B tree was null")}
    for (let member of splitMembers){
      parent.add_data_no_propagation(member)
    }

    if (parent.get_members().length > this.maxMembersInnerNodes){
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

    let relationValueSet = new Set<any>()
    for (let relationValue of node.get_children().map(e => e.value)){
      relationValueSet.add(relationValue)
    }

    let orderedRelationValues = Array.from(relationValueSet).sort(this.memberNameComparisonFunction)

    let splitIndex = Math.floor(orderedRelationValues.length / 2)
    let splitValue : any = orderedRelationValues[splitIndex]
    // let smallRelationValues = orderedRelationValues.slice(0, splitIndex)
    // let largeRelationValues = orderedRelationValues.slice(splitIndex+1)

    let smallRelations = []
    let largeRelations = []

    for (let relation of node.getRelations()){
      if (this.memberNameComparisonFunction(splitValue, relation.value) > 0){
        smallRelations.push(relation)
      } else if (this.memberNameComparisonFunction(splitValue, relation.value) < 0){
        largeRelations.push(relation)
      } else{
        if (relation.type === ChildRelation.LesserThanRelation){
          // smallRelations.push(relation)
        } else if (relation.type === ChildRelation.GreaterThanRelation){
          // largeRelations.push(relation)
        }
      }
    }

    let smallMembers = new Array<Member>();
    let largeMembers = new Array<Member>();
    let splitMembers = new Array<Member>();
    for (let member of node.get_members()){
      if (this.memberNameComparisonFunction(splitValue, member.get_representation()) > 0){
        smallMembers.push(member) 
      } else if (this.memberNameComparisonFunction(splitValue, member.get_representation()) < 0){
        largeMembers.push(member)
      } else if (member.get_representation() === splitValue){
        splitMembers.push(member);
      } else {
        throw new Error('member name not in list')
      }
    }

    let parent = null;
    let nodeHasParent = true;
    if (node.has_parent_node()){
      parent = node.get_parent_node()
    } else {
      nodeHasParent = false;
      node.clear()
      parent = node
    }


    console.log("BEFORE", parent.getRelations())

    
    let smallChildrenNode = new Node(null, parent, this)
    let largeChildrenNode = new Node(null, parent, this)
    
    smallChildrenNode.set_children(smallRelations)
    smallChildrenNode.set_members(smallMembers)
    smallChildrenNode.fix_total_member_count()

    largeChildrenNode.set_children(largeRelations)
    largeChildrenNode.set_members(largeMembers)
    largeChildrenNode.fix_total_member_count()

    
    if (splitMembers.length === 0) { throw new Error(" Parent could not create a relation with two new child nodes ")}




    if (nodeHasParent) {
      this.swapNodeChildWithNewChildren(parent, node, smallChildrenNode, largeChildrenNode, splitValue)
      // parent.remove_child(node)
      this.get_cache().delete_node(node) // delete fragment cause we will only accept one node per fragment
    } else {
      let smallChildRelation = this.createRelation(ChildRelation.LesserThanRelation, splitValue, smallChildrenNode.get_identifier())
      let largeChildRelation = this.createRelation(ChildRelation.GreaterThanRelation, splitValue, largeChildrenNode.get_identifier())
      parent.add_child_with_relation(smallChildRelation, smallChildrenNode)
      parent.add_child_with_relation(largeChildRelation, largeChildrenNode)
      for (let member of splitMembers){
        parent.add_data_no_propagation(member)
      }
      this.set_root_node_identifier(node.get_identifier())
    }

    parent.fix_total_member_count()
    
    if (parent.get_members().length >= this.maxMembersInnerNodes){
      this.splitInternalNode(parent, value)
    }


    console.log(splitValue)
    console.log("check kleiner")
    let [smallstart, smallend] = this.checkRelationsMinMax(smallChildrenNode)
    console.log("check groter")
    let [largestart, largeend] = this.checkRelationsMinMax(largeChildrenNode)

    if (smallend !== largestart){
      throw new Error("SPLIT NDOE WRONG MIDDLE")
    }
    if (smallstart !== start || largeend !== end){
      throw new Error("SPLIT NODE WRONG EDGES")
    }
    console.log("check parent")
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
        console.log(node.getRelations())
        console.log(sortedIntervals[i][1] , sortedIntervals[i+1][1])
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
  



