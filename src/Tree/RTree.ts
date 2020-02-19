import { Tree } from './Tree';
import { Member } from '../DataObjects/Member';
import { Node } from '../Node/Node';
import { ChildRelation } from '../Relations/ChildRelation';

import * as terraformer from 'terraformer'
// import * as terraformer from 'terraformer'
import { Identifier } from '../Identifier';
import { Relation } from '../Relation';

export class RTree extends Tree{

  addData(representation: any, member: Member): Node | null {
    let result = null
    if(this.node_count === 0) {
      result = this.createFirstNode(representation, member)
      let rootNode = this.get_root_node()
      rootNode.identifier.value = this.createBoundingBox([rootNode.identifier.value.bbox(), member.get_representation().bbox()])
    } else {
      let rootNode = this.get_root_node()
      if (! this.isContained(member.get_representation(), rootNode.identifier.value)){
        rootNode.identifier.value = this.createBoundingBox([rootNode.identifier.value.bbox(), member.get_representation().bbox()])
      }
      result = this.recursiveAddition(this.get_root_node(), member)
      // this.checkTree()
    }
    return result
  }  

  private recursiveAddition(currentNode : Node, member : Member) : Node {
    let node = null;
    if (currentNode.has_child_relations()){
      let childrenIdentifiers = currentNode.get_children_identifiers_with_relation(ChildRelation.GeospatiallyContainsRelation);
      if (childrenIdentifiers !== null) { // Node has childRelations of type GeospaciallyContainsRelation
        let containingChild = this.findContainingChild(childrenIdentifiers, member.get_representation())
        // Geen child node die de nieuwe data containt
        if (containingChild !== null) {
          // Make sure that this node contains new object

          //TEST
          if (! this.isContained(member.get_representation(), currentNode.identifier.value)) { throw new Error("Uncontained member in tree construction")}


          node = this.recursiveAddition(containingChild, member);
        } else {
          let foundNode = this.findClosestBoundingBoxIndex(currentNode, member.get_representation());
          if (foundNode.get_node_id() === currentNode.get_node_id()){
            node = this.addMemberToNode(currentNode, member)
          } else {
            
            //TEST
            if (! this.isContained(member.get_representation(), currentNode.identifier.value)) { 
              throw new Error("Uncontained member in tree construction") 
            }

            node = this.recursiveAddition(foundNode, member)
          }
        }
      } 
    } 
    if (node === null){
      node = this.addMemberToNode(currentNode, member)
    }
    // Node is a leaf node (does not have any children of type GeospaciallyContainsRelation)
    // this.assertNode(currentNode)
    return node;
  }

  addMemberToNode(currentNode : Node, member : Member){
    if (! this.isContained(member.get_representation(), currentNode.get_identifier().value)){
      let currentNodeBBox = currentNode.get_identifier().value.bbox()
      let dataBBox = member.get_representation().bbox()
      if (currentNodeBBox === undefined || dataBBox === undefined) {throw new Error("bbox was undefined")}

      let oldIdentifier : any = {...currentNode.identifier}
      let newValue = this.bboxToGeoJSON(this.expandBoundingBox(currentNodeBBox, dataBBox));
      currentNode.identifier.value = newValue;
      if (currentNode.has_parent_node()){ currentNode.get_parent_node().update_child(oldIdentifier, currentNode.identifier, currentNode.identifier.value) }
    }
    currentNode.add_data(member);


    // this.assertNode(currentNode)
    
    if (this.checkNodeSplit(currentNode)) {
      return this.splitNode(currentNode, member)
    } else{
      return currentNode;
    } 
  }
  
  searchData(value : any): Member[] {
    return this._search_data_recursive(this.get_root_node(), value)[0]
  }

  searchNode(value : any): Array<Node> {
    let nodes = this._search_data_recursive(this.get_root_node(), value)[1]
    let returnNodes = Array<Node>();
    for (let node of nodes){
      for (let member of node.get_members()){
        if (this.isContained(member.get_representation(), value)){
          returnNodes.push(node)
          break;
        }
      }  
    }
    return returnNodes
  }

  private _search_data_recursive(currentNode : Node, area: terraformer.Polygon | terraformer.Point) : [Array<Member>, Array<Node>]{
    let childrenIdentifiers = currentNode.get_children_identifiers_with_relation(ChildRelation.GeospatiallyContainsRelation)
    let resultingMembers :  Array<Member> = currentNode.members
    let resultingNodes :  Array<Node> = new Array();


    if (childrenIdentifiers !== null) {
      let containingChildren = this.findContainingOrOverlappingChildren(childrenIdentifiers, area)
      for (let child of containingChildren){
        let [resMems, resNodes] = this._search_data_recursive(child, area)
        resultingMembers = resultingMembers.concat(resMems)
        resultingNodes = resultingNodes.concat(resNodes)
      };
    } 
    resultingNodes.push(currentNode)
    return [resultingMembers, resultingNodes]
  }

  private findClosestBoundingBoxIndex(currentNode : Node, dataGeoObject : any) : Node {

    let childrenIdentifiers = currentNode.get_children_identifiers_with_relation(ChildRelation.GeospatiallyContainsRelation);
    if (childrenIdentifiers === null ){ throw new Error("impossible") }
    let boundingBoxList = childrenIdentifiers.map(identifier => identifier.value);

    let smallestBoundingBoxIndex = 0;
    let smallestBoundingBox = null;
    let smallestSizeDifference = Infinity;
    
    let dataBoundingBox = dataGeoObject.bbox()
    if (dataBoundingBox === undefined) {throw new Error("undefined bounding box for the given data")}

    for (let i = 0; i < boundingBoxList.length; i++){
      let childParsed = boundingBoxList[i]
      let childBoundingBox = childParsed.bbox()
      if (childBoundingBox === undefined) {throw new Error("undefined bounding box for the given child node value")}
      let expandedBoundingBox = this.expandBoundingBox(dataBoundingBox, childBoundingBox)
      let expandedBboxSize = this.getBBoxSize(expandedBoundingBox)
      let sizeDifference = expandedBboxSize - this.getBBoxSize(childBoundingBox)

      if (sizeDifference < smallestSizeDifference){
        smallestBoundingBox = expandedBoundingBox
        smallestSizeDifference = sizeDifference
        smallestBoundingBoxIndex = i;
      }
    }

    if (smallestBoundingBox === null){
      throw new Error("couldnt split node")
    } else {
      /**
       * Update the child node value with least expanding bounding box on addition of new member, because member is going to be added to that node
      */ 
      let oldIdentifier = childrenIdentifiers[smallestBoundingBoxIndex]
      let newValue = this.bboxToGeoJSON(smallestBoundingBox) 
      let newIdentifier = new Identifier(oldIdentifier.nodeId, newValue)
      currentNode.update_child(oldIdentifier, newIdentifier, newIdentifier.value)
      let node = this.get_cache().get_node(oldIdentifier);

      node.identifier.value = newValue

      if(! this.isContained(dataGeoObject, newValue)){
        throw new Error("NOT CONTAINED ON FINDCLOSESTCHILD")
      }

      return node;
    }
  }



  private splitNode(node : Node, addedMember : Member | null) : Node {
    
    let childrenIdentifiers = node.get_children_identifiers_with_relation(ChildRelation.GeospatiallyContainsRelation)
    if (childrenIdentifiers === null || childrenIdentifiers.length === 0) { 
      // We are splitting a leaf node, and have to devide the Members
      return this.splitLeafNode(node, addedMember);

    } else {
      // We are splitting an internal node, and have to devide the children
      return this.splitInnerNode(node)
      
    }
    
  }


  private splitLeafNode(node : Node, addedMember: Member | null){
    let parent = null;
    let splitNode1 = null;
    let splitNode2 = null;
    
    let entryBboxes = node.get_members().map(e => e.get_representation().bbox())
    let splitAxis = this.chooseAxis(entryBboxes, node.get_identifier().value.bbox()) // 0 == split on X axis, 1 == split on Y axis
    if (splitAxis !== 0 && splitAxis !== 1) { throw new Error("invalid axis passed to the distribute function") }

    let items = node.get_members()

    items.sort((a, b) => (this.getBBox(a.get_representation())[splitAxis] > this.getBBox(b.get_representation())[splitAxis]) ? 1 : -1)
  
    let node1items = items.slice(0, Math.floor(items.length / 2));
    let node2items = items.slice(Math.floor(items.length / 2), items.length);

    parent = node;
    if (node.has_parent_node()){
      parent = node.get_parent_node()
      // this.assertNode(parent)
      
    }
    let node1value = this.createBoundingBox(node1items.map(e=>this.getBBox(e.get_representation())))
    let node2value = this.createBoundingBox(node2items.map(e=>this.getBBox(e.get_representation())))
    splitNode1 = new Node(node1value, parent, this)
    splitNode2 = new Node(node2value, parent, this)


    // this.assertNode(node)

    if (! (this.isContained(node1value, parent.identifier.value) &&  this.isContained(node2value, parent.identifier.value))){
      throw new Error("Child node not contained on split")
    }

    splitNode1.set_members(node1items)
    splitNode2.set_members(node2items)
    
    splitNode1.fix_total_member_count()
    splitNode2.fix_total_member_count()

    if (node.has_parent_node()){
      let relationsList = [ChildRelation.GeospatiallyContainsRelation, ChildRelation.GeospatiallyContainsRelation]
      let newChildrenList = [splitNode1, splitNode2]
      let valuesList = [node1value, node2value]
      parent.swapChildren(node, relationsList, newChildrenList, valuesList)
      parent.fix_total_member_count()
      this.get_cache().delete_node(node) // delete fragment cause we will only accept one node per fragment
    } else {
      node.clear()
      node.add_child(ChildRelation.GeospatiallyContainsRelation, splitNode1, node1value)
      node.add_child(ChildRelation.GeospatiallyContainsRelation, splitNode2, node2value)
      node.fix_total_member_count()
      this.set_root_node_identifier(node.get_identifier())
      parent = node;
    }

    
    // this.assertNode(parent)

    if (parent.get_children_identifiers_with_relation(ChildRelation.GeospatiallyContainsRelation).length >= this.max_fragment_size) {
      this.splitNode(parent, null);
    } 


    if (addedMember !== null){
      // We need to return the node where the treedataobject ended up.
      if (splitNode1.get_members().indexOf(addedMember) != -1){
        return splitNode1
      } else {
        return splitNode2
      }

    }

    return node;
  }



  private splitInnerNode(node: Node){
    let parent = null;
    let splitNode1 = null;
    let splitNode2 = null;

    let childrenIdentifiers = node.get_children_identifiers_with_relation(ChildRelation.GeospatiallyContainsRelation)
    let totalEntryBBoxes = childrenIdentifiers.map(e => e.value.bbox())
    // let membersEntryBboxes = node.get_members().map(e => e.get_representation().bbox())
    // let totalEntryBBoxes = entryBboxes.concat(membersEntryBboxes)
    let splitAxis = this.chooseAxis(totalEntryBBoxes, node.get_identifier().value.bbox()) // 0 == split on X axis, 1 == split on Y axis

    let node1members = new Array()
    let node2members =  new Array()
    let node1childrenIdentifiers = new Array()
    let node2childrenIdentifiers = new Array()
    if (splitAxis !== 0 && splitAxis !== 1) { throw new Error("invalid axis passed to the distribute function") }

    let items = totalEntryBBoxes
    items = items.sort((a, b) => (a[splitAxis] > b[splitAxis]) ? 1 : -1)

    let splitValue = items[Math.floor(items.length / 2)][splitAxis];

    let node1bboxes = []
    let node2bboxes = []
    for (let member of node.get_members()){
      if (member.get_representation().bbox()[splitAxis] <= splitValue){
        node1members.push(member)
        node1bboxes.push(member.get_representation().bbox())
      } else {
        node2members.push(member)
        node2bboxes.push(member.get_representation().bbox())
      }
    }

    for (let childIdentifier of childrenIdentifiers){
      if (childIdentifier.value.bbox()[splitAxis] <= splitValue){
        node1childrenIdentifiers.push(childIdentifier)
        node1bboxes.push(childIdentifier.value.bbox())
      } else {
        node2childrenIdentifiers.push(childIdentifier)
        node2bboxes.push(childIdentifier.value.bbox())
      }
    }
    let node1value = this.createBoundingBox(node1bboxes)
    let node2value = this.createBoundingBox(node2bboxes)


    if (node.has_parent_node()){
      parent = node.get_parent_node()
    } else {
      parent = node;
      node.clear()
      let nodeValue = this.createBoundingBox([node1value.bbox(), node2value.bbox()])
      
      node.identifier.value = nodeValue
    }

    splitNode1 = new Node(node1value, null, this)
    splitNode2 = new Node(node2value, null, this)

    for(let identifier of node1childrenIdentifiers){
      splitNode1.add_child(ChildRelation.GeospatiallyContainsRelation, this.get_cache().get_node(identifier), identifier.value)
    }
    for(let member of node1members){
      splitNode1.add_data(member)
    }

    for(let identifier of node2childrenIdentifiers){
      splitNode2.add_child(ChildRelation.GeospatiallyContainsRelation, this.get_cache().get_node(identifier), identifier.value)
    }
    for(let member of node2members){
      splitNode2.add_data(member)
    }

    splitNode1.fix_total_member_count()
    splitNode2.fix_total_member_count()



    for (let member of node1members){
      if (! this.isContained(member.representation, node1value)){
        throw new Error("LEAF SPLIT ERROR 1")
      }
    }
    for (let member of node2members){
      if (! this.isContained(member.representation, node2value)){
        throw new Error("LEAF SPLIT ERROR 2")
      }
    }
    for (let childIdentifier of node1childrenIdentifiers){
      if (! this.isContained(childIdentifier.value, node1value)){
       throw new Error("LEAF SPLIT ERROR 3")
      }
    }
    for (let childIdentifier of node2childrenIdentifiers){
      if (! this.isContained(childIdentifier.value, node2value)){
        throw new Error("LEAF SPLIT ERROR 4")
      }
    }

    if (node.has_parent_node()){

      let relationsList = [ChildRelation.GeospatiallyContainsRelation, ChildRelation.GeospatiallyContainsRelation]
      let newChildrenList = [splitNode1, splitNode2]
      let valuesList = [node1value, node2value]
      parent.swapChildren(node, relationsList, newChildrenList, valuesList)

      this.get_cache().delete_node(node) // delete fragment cause we will only accept one node per fragment
      
    } else {
      node.add_child(ChildRelation.GeospatiallyContainsRelation, splitNode1, node1value)
      node.add_child(ChildRelation.GeospatiallyContainsRelation, splitNode2, node2value)
      this.set_root_node_identifier(node.get_identifier())
    }

    
    // this.assertNode(parent)

    parent.fix_total_member_count()
    let parentChildren = parent.get_children_identifiers_with_relation(ChildRelation.GeospatiallyContainsRelation)
    if (parentChildren != null && parentChildren.length >= this.max_fragment_size) {
      this.splitNode(parent, null);
    } 
    return parent;
  }



  private createBoundingBox(bboxes : Array<Array<number>>) : any{
    let xmin = Math.min.apply(null, bboxes.map(e => e[0]))
    let ymin = Math.min.apply(null, bboxes.map(e => e[1]));
    let xmax = Math.max.apply(null, bboxes.map(e => e[2]));
    let ymax = Math.max.apply(null, bboxes.map(e => e[3]));
    let newBBox = [xmin, ymin, xmax, ymax]
    return this.bboxToGeoJSON(newBBox)
  }

  private bboxToGeoJSON(bbox : Array<number>) {
    return new terraformer.Polygon([[[bbox[0], bbox[1]], [bbox[0], bbox[3]], [bbox[2], bbox[3]], [bbox[2], bbox[1]]]])
  }

  private expandBoundingBox( bbox1 : Array<number>, bbox2 : Array<number>) : Array<number> {
    return ([Math.min(bbox1[0], bbox2[0]), Math.min(bbox1[1], bbox2[1]), Math.max(bbox1[2], bbox2[2]), Math.max(bbox1[3], bbox2[3])])
  }

  private getBBoxSize(bbox : Array<number>) : number {
    return Math.abs(bbox[2] - bbox[0]) * Math.abs(bbox[3] - bbox[1])
  }

  private getBBox(dataGeoObject : any) {
    let result = dataGeoObject.bbox()
    return result === undefined ? new Error("Trying to parse an incorrect wkt string") : result;
  }

  private findContainingChild(childrenIdentifiers : Array<Identifier>, dataGeoObject : terraformer.Polygon | terraformer.Point) : Node | null{
    for (let childIdentifier of childrenIdentifiers){
      if (this.isContained(dataGeoObject, childIdentifier.value)){
        return this.get_cache().get_node(childIdentifier);
      }
    }
    return null;
  }


  private findContainingOrOverlappingChildren(childrenIdentifiers : Array<Identifier>, dataGeoObject : terraformer.Polygon | terraformer.Point) : Node[]{
    let children = []
    for (let childIdentifier of childrenIdentifiers){
      if (this.isContained(dataGeoObject, childIdentifier.value) || this.isOverlapping(dataGeoObject, childIdentifier.value)){
        children.push(this.get_cache().get_node(childIdentifier))
      }
    }
    return children;
  }

  private isContained(contined_object : any, container : any) : boolean {
      // if (childGeoObject instanceof terraformer.Point)  { return false } // Point cannot contain other polygon or point
      try {
        if (! container.contains(contined_object)){
          let bbox = container.bbox();
          if (contined_object instanceof terraformer.Point){
            return this.bboxContainsPoint(bbox, contined_object.coordinates)
          } else if (contined_object instanceof terraformer.Polygon){
            for (let coordinate of contined_object.coordinates[0]){
              if (! this.bboxContainsPoint(bbox, coordinate)){
                return false;
              }
            }
            return true
          }
          return false
        } else {
          return true;
        }
      } catch(err){
          return false;
      }
  }

  private bboxContainsPoint(bbox: any, pointCoordinates: any){
    if ((bbox[0] <= pointCoordinates[0] && pointCoordinates[0] <= bbox[2]) &&
    (bbox[1] <= pointCoordinates[1] && pointCoordinates[1] <= bbox[3])){
      return true;
    }
    return false;
  }


  private isOverlapping(dataGeoObject : terraformer.Polygon | terraformer.Point, childGeoObject : any) : boolean {
    if (childGeoObject instanceof terraformer.Point || dataGeoObject instanceof terraformer.Point)  { return false } // Point cannot contain other polygon or point
    let childWKTPrimitive = new terraformer.Primitive(childGeoObject)
    try {
      return (childWKTPrimitive.intersects(dataGeoObject))
    } catch(err){
        return false;
    }
  }


  private chooseAxis(entryBboxes : Array<any>, containerBBox : any) : number { // 0 = split on the X axis, 1 = split on the Y axis

    let [seed1index, seed2index] = this.pickSeeds(entryBboxes) // find two most distant rectangles of the current node
    let seed1bbox = entryBboxes[seed1index]
    let seed2bbox = entryBboxes[seed2index]

    let Xdistance = 0
    let Ydistance = 0
    let Xoverlap = false
    let Yoverlap = false

    let containerXsize = Math.abs(containerBBox[2] - containerBBox[0])
    let containerYsize = Math.abs(containerBBox[3] - containerBBox[1])

    let [smallestXaxisBBox, largestXaxisBBox] = seed1bbox[0] < seed2bbox[0] ? [seed1bbox, seed2bbox] : [seed2bbox, seed1bbox]

    if (smallestXaxisBBox[0] < largestXaxisBBox[0]){
      if (smallestXaxisBBox[2] < largestXaxisBBox[0]){
        // no overlap on X axis
        Xdistance = Math.abs(largestXaxisBBox[0] - smallestXaxisBBox[2]) // / containerXsize
        Xoverlap = false;
      } else if (smallestXaxisBBox[2] < largestXaxisBBox[2]){
        // Both bboxes overlap on X axis
        Xdistance = Math.abs(smallestXaxisBBox[2] - largestXaxisBBox[0]) // / containerXsize
        Xoverlap = true;
      } else if (smallestXaxisBBox[2] < largestXaxisBBox[0]){
        // full overlap (node 2 in node 1 on X axis)
        Xdistance = Math.abs(largestXaxisBBox[2] - largestXaxisBBox[0]) // / containerXsize
        Xoverlap = true;
      } 
    }


    let [smallestYaxisBBox, largestYaxisBBox] = seed1bbox[1] < seed2bbox[1] ? [seed1bbox, seed2bbox] : [seed2bbox, seed1bbox]

    if (smallestYaxisBBox[1] < largestYaxisBBox[1]){
      if (smallestYaxisBBox[3] < largestYaxisBBox[1]){
        // no overlap on Y axis
        Ydistance = Math.abs(largestYaxisBBox[1] - smallestYaxisBBox[3]) // / containerYsize
        Yoverlap = false;
      } else if (smallestYaxisBBox[3] < largestYaxisBBox[3]){
        // Both bboxes overlap on Y axis
        Ydistance = Math.abs(smallestYaxisBBox[3] - largestYaxisBBox[1]) // / containerYsize
        Yoverlap = true;
      } else if (smallestYaxisBBox[3] < largestYaxisBBox[1]){
        // full overlap (node 2 in node 1 on Y axis)
        Ydistance = Math.abs(largestYaxisBBox[3] - largestYaxisBBox[1]) // / containerYsize
        Yoverlap = true;
      } 
    }

    if (Xoverlap){
      if (Yoverlap){
        // yes Xoverlap, yes Yoverlap
        return Xdistance < Ydistance ?  0 : 1 // Split on the smallest distance => x distance smaller -> split X axis ( = 0 )
      } else {
        // yes Xoverlap, no Yoverlap
        return 1 // So we split the Y axis
      }
    } else if (Yoverlap){
      // no Xoverlap, yes Yoverlap
        return 0 // So we split the X axis
    } else {
      // no Xoverlap, no Yoverlap
      return Xdistance < Ydistance ?  1 : 0 // Split on the largest distance => y distance bigger -> split y axis ( = 1 )
    } 
  }

  private pickSeeds(boundingBoxList : Array<Array<number>>) : number[]{
    let maxDValue = 0
    let maxDItemIndices = [0, 1]

    for (let i = 0; i < boundingBoxList.length - 1; i++){
      for (let j = i + 1; j < boundingBoxList.length; j++){
        let R = this.expandBoundingBox(boundingBoxList[i], boundingBoxList[j])
        let d = this.getBBoxSize(R) - this.getBBoxSize(boundingBoxList[i]) - this.getBBoxSize(boundingBoxList[j])

        if (d > maxDValue){
          maxDValue = d;
          maxDItemIndices = [i, j]
        }
      }
    }
    return maxDItemIndices;
  }

  checkNode(node : Node){
    if (node.identifier.nodeId === "/rtree_streets/1/node76.jsonld" || node.identifier.nodeId === "/rtree_streets/1/node99.jsonld"){
    }
    for (let member of node.get_members()){
      if (! this.isContained(member.get_representation(), node.identifier.value)){
        return false;
      } 
    }
    for (let relation of node.getRelations()){
      if (! this.isContained(relation.value, node.identifier.value)){
        return false
      }
    }
    if (node.has_parent_node()){
      for (let relation of node.get_parent_node().getRelations()){
        if (relation.identifier.nodeId === node.identifier.nodeId){
          if (relation.identifier.value !== node.identifier.value){
            throw new Error("not the same values")
          }
        }
      }
    }
    return true;
  }

  checkNodeRecusive(node : Node){
    this.assertNode(node);
    for (let relation of node.getRelations()){
     this.checkNodeRecusive(this.cache.get_node(relation.identifier));
    }

  }

  checkTree(){
    let rootNode = this.get_root_node()
    this.checkNodeRecusive(rootNode)
  }

  assertNode(node:Node){
    if (! this.checkNode(node)){
      throw new Error("Error asserting Node")
    }
  }
}



