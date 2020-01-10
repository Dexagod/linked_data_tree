import { Tree } from './Tree';
import { Member } from '../DataObjects/Member';
import { Node } from '../Node/Node';
import { ChildRelation } from '../Relations/ChildRelation';
import { Identifier } from '../Identifier';
import { Relation } from '../Relation';
import { Interval } from '../Interval';

/*
TODO:: FIX TOTAL COUNTS
*/

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
    let interval : Interval = {start: null, end: null, startrelation:null, endrelation:null}
    this.nodePath = []
    return this.recursiveAddition(this.get_root_node(), member, representation, interval)
  }

  nodePath : Array<Node> = new Array();

  private isInInterval(interval : Interval, value : any, comparisonFunction: Function){
    if (interval.start !== null){
      if (interval.startrelation === ChildRelation.GreaterThanRelation){
        if (! (comparisonFunction(value, interval.start) > 0)){
          return false;
        }
      } else if(interval.startrelation === ChildRelation.GreaterOrEqualThanRelation){
        if (! (comparisonFunction(value, interval.start) >= 0)){
          return false;
        }
      }
    }
    if (interval.end !== null){
      if (interval.endrelation === ChildRelation.LesserThanRelation){
        if(! (comparisonFunction(value, interval.end) < 0)){
          return false;
        }
      } else if(interval.endrelation === ChildRelation.LesserOrEqualThanRelation){
        if (! (comparisonFunction(value, interval.end) <= 0)){
          return false;
        }
      }
    }
    return true;
  }
  
  private recursiveAddition(currentNode : Node, member : Member, value : any, interval : Interval, level = 0) : Node {
    this.nodePath.push(currentNode)
    if (currentNode.has_child_relations()){
      let intervalMap = this.getIntervals(currentNode.getRelations()) 
      
      let possibleTargetNodes = []; // List[ [id, interval], .. ]
      for (let entry of Array.from(intervalMap.entries())){
        if ( this.isInInterval(entry[1], value, compare)){
          possibleTargetNodes.push(entry)
        }
      }

      if (possibleTargetNodes.length > 0){
        possibleTargetNodes = possibleTargetNodes.sort((a:any, b:any) => { return this.get_cache().get_node_by_id(a[0]).get_remainingItems() - this.get_cache().get_node_by_id(b[0]).get_remainingItems()})
        return this.recursiveAddition(this.get_cache().get_node_by_id(possibleTargetNodes[0][0]), member, value, possibleTargetNodes[0][1], level + 1)  
      }
     
    } 

    if (currentNode.has_child_relations()){ 
      throw new Error("There is a gap between the nodes where a value fell through.")
    }

    if (member !== null) {
      currentNode.add_data(member)
      if (this.checkNodeSplit(currentNode)) {
        let node = this.splitLeafNode(currentNode, interval, value)
        return node;
      }
    }
    return currentNode;
  
  }

  private getIntervals(relationList: Array<Relation>) : Map<any, Interval>{

    let relationMap = new Map()
    for (let relation of relationList){
      if (relation.type === ChildRelation.LesserOrEqualThanRelation){
        this.addToIntervalMap(relationMap, relation.identifier.nodeId , null, relation.value, relation)
      }
      if (relation.type === ChildRelation.LesserThanRelation){
        this.addToIntervalMap(relationMap, relation.identifier.nodeId , null, relation.value, relation)
      }
      if (relation.type === ChildRelation.GreaterThanRelation){
        this.addToIntervalMap(relationMap, relation.identifier.nodeId , relation.value, null, relation)
      }
      if (relation.type === ChildRelation.GreaterOrEqualThanRelation){
        this.addToIntervalMap(relationMap, relation.identifier.nodeId , relation.value, null, relation)
      }
    }
    return relationMap
  }

  getParentRelations(node : Node){
    let GTrelation = null;
    let LTrelation = null;
    if (! node.has_parent_node()){
      return {gtrelation: null, ltrelation: null}
    } 
    let parent = node.get_parent_node()
    if (parent === null || parent === undefined){
      return {gtrelation: null, ltrelation: null}
    } 
    let relations = parent.getRelationsForChild(node.identifier)
    if (relations.length !== 1 && relations.length !== 2) { throw new Error("Incorrect number of relations to child node") }
    for (let relation of relations){
      if (relation.type === ChildRelation.GreaterThanRelation || relation.type === ChildRelation.GreaterOrEqualThanRelation){
        GTrelation = relation;
      } else {
        LTrelation = relation;
      }
    }
    return {gtrelation: GTrelation, ltrelation: LTrelation};
    
  }
  
  splitLeafNode(node : Node, interval : Interval, value : any) : Node{
    for (let element of node.get_members().map(e=>e.get_representation())){
      if (interval.start !== null && compare(interval.start, element) > 0){
        throw new Error("unsanitary node1")
      }
      if (interval.end !== null && compare(interval.end, element) < 0){
        throw new Error("unsanitary node2")
      }
    }

    let nodeMembers = node.members.sort(this.compareMembers)
    let smallMembers = nodeMembers.slice(0, Math.floor(nodeMembers.length / 2));
    let largeMembers = nodeMembers.slice(Math.floor(nodeMembers.length / 2));

    let splitMember = smallMembers.pop()
    if (splitMember === undefined) { throw new Error("could not define split position")}

    node.deleteMembers() // SPLITVALUE is highest value for the LesserThanOrEqual relation
  
    let parent = null;
    let nodeHasParent = true;
    let parentRelations = this.getParentRelations(node)

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

    /***
     * SETTING THE NEW RELATION VALUES
     */
    if (interval.start !== null){
      let relationType = interval.startrelation
      if (relationType === null || relationType === undefined) { throw new Error() }
      // if (smallMembers.map((e:any) => e.get_representation()).indexOf(interval.start) !== -1){
      //   relationType = ChildRelation.GreaterOrEqualThanRelation
      // }
      // if (parentRelations.gtrelation !== null) { relationType = parentRelations.gtrelation.type }
      relationList.push( this.createRelation(relationType, interval.start, smallMembersNode.get_identifier()) )
      newChildrenList.push(smallMembersNode)
    }

    relationList.push( this.createRelation(ChildRelation.LesserOrEqualThanRelation, splitMember.get_representation(), smallMembersNode.get_identifier()) )
    newChildrenList.push(smallMembersNode)
    
    let afterSplitRelation = splitMember.get_representation() === largeMembers[0].get_representation() ? 
        ChildRelation.GreaterOrEqualThanRelation : ChildRelation.GreaterThanRelation

    relationList.push( this.createRelation(afterSplitRelation, splitMember.get_representation(), largeMembersNode.get_identifier()) )
    newChildrenList.push(largeMembersNode)
    
    if (interval.end !== null){
      let relationType = interval.endrelation
      if (relationType === null || relationType === undefined) { throw new Error() }
      // let relationType = ChildRelation.LesserOrEqualThanRelation
      // if (parentRelations.ltrelation !== null) { relationType = parentRelations.ltrelation.type }
      relationList.push( this.createRelation(relationType, interval.end, largeMembersNode.get_identifier()) )
      newChildrenList.push(largeMembersNode)
    }

    this.checkRelationsMinMax(parent)
    
    if (nodeHasParent) {
      parent.swapChildrenWithRelation(node, relationList, newChildrenList)
      parent.add_data_no_propagation(splitMember)
      this.get_cache().delete_node(node) // delete fragment cause we will only accept one node per fragment
    } else {
      for (let i = 0; i < relationList.length; i++){
        node.add_child_no_propagation_with_relation(relationList[i], newChildrenList[i])
      }
      node.add_data_no_propagation(splitMember)
      this.set_root_node_identifier(node.get_identifier())
    }

    smallMembersNode.fix_total_member_count()
    largeMembersNode.fix_total_member_count()
    parent.fix_total_member_count()


    if (parent.getRelations().length > this.max_fragment_size){
      this.splitInternalNode(parent, value)
    }
    return largeMembersNode; // THIS CAN BE INCORRECT BUT IT DOESNT MATTER ANYMORE, WAS USED FOR TESTING PURPOSES
  }


  splitInternalNode(node : Node, value : any){
    // splitting an internal node

    let memberList = node.get_members().sort(this.compareMembers)
    let intervalMap = this.getIntervals(node.getRelations())
    let intervalEntries = Array.from(intervalMap.entries()).sort(this.comparisonFunction)

    let smallChildrenNodeEntries = intervalEntries.slice(0, Math.ceil(intervalEntries.length / 2))
    let largeChildrenNodeEntries = intervalEntries.slice(Math.ceil(intervalEntries.length / 2))

    let splitValueSmall = smallChildrenNodeEntries[smallChildrenNodeEntries.length - 1][1].end
    let splitValueLarge = largeChildrenNodeEntries[0][1].start
    let splitRelationLarge = largeChildrenNodeEntries[0][1].startrelation


    let smallMembers = memberList.slice(0, Math.floor(node.members.length / 2)+1);
    let largeMembers = memberList.slice(1+Math.floor(node.members.length / 2));

    let splitMember = smallMembers.pop()
    if (splitMember === undefined ) { throw new Error("could not define split position")}

    if (splitMember.get_representation() !== splitValueSmall){ 
      // console.log(memberList.map(e=>e.representation), "\n", splitMember.get_representation(), splitValueSmall, "\n", smallChildrenNodeEntries.map(e=>[e[1].start, e[1].end]), largeChildrenNodeEntries.map(e=>[e[1].start, e[1].end]));
      throw new Error("Split member does not equal split value")
    }

    node.deleteMembers() // SPLITVALUE is highest value for the LesserThanOrEqual relation



    let parent = null;
    let nodeHasParent = true;

    let parentRelations = this.getParentRelations(node)

    if (node.has_parent_node()){
      parent = node.get_parent_node()
    } else {
      nodeHasParent = false;
      node.clear()
      parent = node
    }

    let smallChildrenNode = new Node(null, parent, this)
    let largeChildrenNode = new Node(null, parent, this)

    smallChildrenNode.set_members(smallMembers)
    largeChildrenNode.set_members(largeMembers)

    for (let nodeEntries of [{entries: smallChildrenNodeEntries, node: smallChildrenNode}, {entries: largeChildrenNodeEntries, node: largeChildrenNode} ]){
      for (let entry of nodeEntries.entries){
        let entryIdentifier = new Identifier(entry[0], null)
        let interval = entry[1]
        if (entryIdentifier === null || entryIdentifier === undefined || entryIdentifier.nodeId === null || entryIdentifier.nodeId === undefined ) { throw new Error(" undefined entry identifier ")}

        if (interval.start !== null && interval.startrelation !== null){
          let smallrelation = new Relation(interval.startrelation, interval.start, entryIdentifier)
          nodeEntries.node.add_child_with_relation(smallrelation, this.cache.get_node(entryIdentifier))
        } 
        if (interval.end !== null && interval.endrelation !== null){
          let largerelation = new Relation(interval.endrelation, interval.end, entryIdentifier)
          nodeEntries.node.add_child_with_relation(largerelation, this.cache.get_node(entryIdentifier))
        } 
      }
    }

    if (nodeHasParent) {
      parent = this.swapNodeChildWithNewChildren(parent, node, smallChildrenNode, largeChildrenNode, splitValueSmall, splitValueLarge, splitRelationLarge)
      parent.add_data_no_propagation(splitMember)

      this.get_cache().delete_node(node) // delete fragment cause we will only accept one node per fragment
    } else {

      let ltrelation = parentRelations.ltrelation !== null ? parentRelations.ltrelation.type : ChildRelation.LesserOrEqualThanRelation;
      let gtrelation = parentRelations.gtrelation !== null ? parentRelations.gtrelation.type : splitRelationLarge;

      let smallChildRelation = this.createRelation(ltrelation, splitValueSmall, smallChildrenNode.get_identifier())
      let largeChildRelation = this.createRelation(gtrelation, splitValueLarge, largeChildrenNode.get_identifier())
      node.add_child_with_relation(smallChildRelation, smallChildrenNode)
      node.add_child_with_relation(largeChildRelation, largeChildrenNode)
      this.set_root_node_identifier(node.get_identifier())
      node.add_data_no_propagation(splitMember)
    }

    smallChildrenNode.fix_total_member_count()
    largeChildrenNode.fix_total_member_count()
    parent.fix_total_member_count()
    
    if (parent.getRelations().length > this.max_fragment_size){
      this.splitInternalNode(parent, value)
    }
    return node;
  }
  
  
  swapNodeChildWithNewChildren(parent: Node, oldNode: Node, smallChildrenNode : Node, largeChildrenNode : Node, splitValueSmall : any, splitValueLarge: any, splitRelationLarge:any){
    let childRelations = parent.children;
    let oldNodeLTERelation : null | Relation = null;
    let oldNodeGTRelation : null | Relation = null;

    let newRelations = new Array();

    if (splitValueSmall === null || splitValueSmall === undefined || splitValueLarge === null || splitValueLarge === undefined){
      throw new Error("Null value split on node swap.")
    }

    for (let relation of childRelations){
      if (relation.identifier.nodeId === oldNode.get_node_id()){
        if (relation.type === ChildRelation.LesserThanRelation || relation.type === ChildRelation.LesserOrEqualThanRelation){
          oldNodeLTERelation = relation
        } else if (relation.type === ChildRelation.GreaterThanRelation || relation.type === ChildRelation.GreaterOrEqualThanRelation){
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
    
    /****
     * Add relations to new Node, depending on the realtions of the old node
     */
    if (oldNodeGTRelation !== null && oldNodeGTRelation !== undefined){
      newRelations.push(this.createRelation(oldNodeGTRelation.type, oldNodeGTRelation.value, smallChildrenNode.get_identifier()))
    }
    newRelations.push(this.createRelation(ChildRelation.LesserOrEqualThanRelation, splitValueSmall, smallChildrenNode.get_identifier()))

    // let relationType = splitValueSmall === splitValueLarge? ChildRelation.GreaterOrEqualThanRelation : ChildRelation.GreaterThanRelation
    
    newRelations.push(this.createRelation(splitRelationLarge, splitValueSmall, largeChildrenNode.get_identifier()))
    // newRelations.push(this.createRelation(relationType, splitValueSmall, largeChildrenNode.get_identifier()))

    if (oldNodeLTERelation !== null && oldNodeLTERelation !== undefined){
      newRelations.push(this.createRelation(oldNodeLTERelation.type, oldNodeLTERelation.value, largeChildrenNode.get_identifier()))
    }

    parent.children = newRelations;

    return parent;
  }

  private addToIntervalMap(map : Map<any, Interval>, id : any, start : any, end : any, relation:Relation) {
    if (! map.has(id)){
      let interval : Interval = { start : null , end : null , startrelation: null, endrelation: null} 
      map.set(id, interval)
    } 
    let updatedInterval = map.get(id)
    if (updatedInterval === undefined){ updatedInterval = { start: null , end: null, startrelation: null, endrelation: null} }
    updatedInterval.start = (start !== null && start !== undefined) ? start : updatedInterval.start
    updatedInterval.end = (end !== null && end !== undefined) ? end : updatedInterval.end

    updatedInterval.startrelation = (start !== null && start !== undefined) ? relation.type : updatedInterval.startrelation
    updatedInterval.endrelation = (end !== null && end !== undefined) ? relation.type : updatedInterval.endrelation
    
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

  private compareMembers(a : Member, b : Member) { 
    return compare(a.get_representation(), b.get_representation()) 
  }

  private comparisonFunction(a : [any, Interval], b : [any, Interval]) { 
    if (a[1].start === null) {return -1}; 
    if (b[1].start === null) {return 1}; 
    if (a[1].end === null) {return 1};
    if (b[1].end === null) {return -1};
    if (a[1].start !== b[1].start){
      return compare(a[1].start, b[1].start) 
    } else {
      return compare(a[1].end, b[1].end) 
    }
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
        let interval = entry[1]
        if (this.isInInterval(interval, searchValue, compare)){        
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
  



