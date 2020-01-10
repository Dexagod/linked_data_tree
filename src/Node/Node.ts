import { Tree } from "../Tree/Tree";
import { ChildRelation } from '../Relations/ChildRelation';
import { Member } from '../DataObjects/Member';
import { Cache } from "../Cache/Cache";
import { Identifier } from '../Identifier';
import { Relation } from '../Relation';

export class Node {

    identifier : Identifier;
    members: Array < Member > ;
    children: Array < Relation >; 
    
    parent_node:  Identifier| null;
    fc: Cache;
    remainingItems: number;


    constructor(value: any, parent_node: Node | null, tree: Tree) {
        this.identifier = new Identifier(tree.provide_node_id(), value);
        this.members = new Array();
        this.children = new Array();
        // Initialize the fragment cache from the given tree.
        this.fc = tree.get_cache();
        if (parent_node !== null) {
            this.parent_node = parent_node.get_identifier();
        } else {
            this.parent_node = null;
        }
        this.remainingItems = 0;
        tree.addNode(this)
    }

    get_identifier() : Identifier{
        return this.identifier;
    }

    get_node_id(): string{
        return this.identifier.nodeId;
    }

    get_parent_node_identifier(): Identifier | null {
        return this.parent_node;
    }
    
    add_relation_without_node(relation : Relation, totalItems : number) {
        this.children.push(relation);
        this.propagate_children_count(totalItems)
    }

    // This function adds a child node to this node.
    // The parent node is set upon creation
    // This method does not propagate the new information in the node. Needed when replacing an old node for multiple new nodes.
    add_child_no_propagation(childRelation: ChildRelation, childNode: Node, value : any) {
        let relation = new Relation(childRelation, value, childNode.get_identifier())
        this.children.push(relation);
        childNode.set_parent_node(this);
    }

    // Add a child node to this node and propagate the new information.
    add_child(childRelation: ChildRelation, node: Node, value : any) {
        this.calculate_propagation(node)
        this.add_child_no_propagation(childRelation, node, value);
    }

    
    add_child_with_relation(relation : Relation, node: Node) {
        this.calculate_propagation(node)
        this.add_child_no_propagation_with_relation(relation, node);
        
    }
    
    add_child_no_propagation_with_relation(relation: Relation, childNode : Node) {
        this.children.push(relation);
        childNode.set_parent_node(this);
    }
    

    calculate_propagation(node : Node){
        let found = false
        for (let relation of this.children){
            if (relation.identifier.nodeId === node.get_node_id()){
                found = true
            }
        }
        if (! found){
            this.set_remainingItems(this.get_remainingItems() + node.get_remainingItems())
        }
    }

    // Return the total amount of children under this node.
    get_remainingItems() {
        return this.remainingItems;
    }

    set_remainingItems(count: number) {
      this.remainingItems = count;
    }

    fix_total_member_count(){
        let newcount = 0
        for(let childNode of this.get_children_objects()){
            newcount += childNode.get_remainingItems()
        }
        newcount += this.get_members().length
        this.set_remainingItems(newcount)
    }

    has_child_relations() : boolean {
      return this.children.length > 0;
    }

    propagate_children_count(increment: number) {
      this.remainingItems += increment;
      if (this.has_parent_node()) {
        this.get_parent_node().propagate_children_count(increment)
      }
    }

    getRelations() : Array<Relation> {
      return this.children;
    }

    getRelationsForChild(childIdentifier: Identifier){
        let relationList = []
        for (let relation of this.children){
            if(relation.identifier.nodeId === childIdentifier.nodeId){
                relationList.push(relation);
            }
        }
        return relationList;
    }

    // Removes a child node from this node
    remove_child(node: Node) {
      let newRelations = new Array<Relation>();
      for (let relation of this.children){
        if (! relation.identifier.equals(node.get_identifier())){
          newRelations.push(relation)
        }
      }
      this.children = newRelations;
    }

    swapChildren(oldChild : Node, relations : Array<ChildRelation>, newChildren : Array<Node>, values : Array<any>){ 
      this.remove_child(oldChild);
      for (let i = 0; i < newChildren.length; i++){
        this.add_child_no_propagation(relations[i], newChildren[i], values[i]);
      }
    }
    
    swapChildrenWithRelation(oldChild : Node, relations : Array<Relation>, newChildren : Array<Node>){
        this.remove_child(oldChild);
        for (let i = 0; i < newChildren.length; i++){
            this.add_child_no_propagation_with_relation(relations[i], newChildren[i])
        }
    }

    clear(){
        this.members = new Array();
        this.children = new Array();
        this.parent_node = null;
        this.remainingItems = 0;
    }
    
    clearChildren(){
        this.children = new Array();
    }

    get_children_identifiers_with_relation(childRelation: ChildRelation): Array<Identifier> {
        let returnList = new Array()
        for (let relation of this.children){
            if (relation.type === childRelation){
                returnList.push(relation.identifier)
            }
        }
        return returnList
    }


    get_children_with_relation(childRelation: ChildRelation): Array<Node> | null {
      let identifierList = this.get_children_identifiers_with_relation(childRelation);
      if (identifierList === null) {return null;}
      return identifierList.map((identifier : Identifier) => this.fc.get_node(identifier))
    }

    // Updates the child node.
    // Used when child changes fragment, so the parent needs to update the child fragment id in its children.
    update_child(oldIdentifier : Identifier, newIdentifier : Identifier) {
        for (let relation of this.children){
            if (relation.identifier.equals(oldIdentifier)){
                relation.identifier = newIdentifier
            }
        }
    }

    // Returns the objects of all children for iteration purposes.
    get_children_objects(): Array<Node> {
        let nodeIds = new Set <string> ()
        this.children.map((relation : Relation) => { nodeIds.add(relation.identifier.nodeId)});

       return Array.from(nodeIds).map( (id : string) => this.fc.get_node_by_id(id))
        
    }

    get_child_by_value(value : any) : Node | null{
        let childrenWithValue = new Array<Node>()
        this.children.map((relation : Relation) => {if (relation.value === value) { childrenWithValue.push(this.fc.get_node(relation.identifier))}})
        if (childrenWithValue.length !== 1) {return null}
        return childrenWithValue[0];
    }

    // Set the children of this node
    // Destructive function!
    // Use only when transfering children from existing node to a newly created node
    set_children(new_children: Array<Relation>) {
        this.children = new_children
        this.update_children()
    }
    
    /**
     * Private method
     * Updates all child nodes with the new fragment of the parent node.
     */
    update_children() {
        let children = this.get_children_objects()
        for (var i = 0; i < children.length; i++) {
            children[i].set_parent_node(this);
        }
    }

    // Return sthe children dict
    get_children() : Array<Relation> {
        return this.children;
    }

    deleteMembers(){
        this.members = new Array();
    }

    /**
     * Sets the parent node.nex
     * @param {Node} node 
     */
    set_parent_node(node: Node | null) {
        if (node === null){
            this.parent_node = null;
        } else {
            this.parent_node = node.get_identifier()
        }
    }

    /**
     * Returns if this node has a parent node.
     * If this is not the case, this is the root node.
     */
    has_parent_node() {
        return this.parent_node != null;
    }

    /**
     * returns the parent node.
     */
    get_parent_node() : Node{
        if (this.parent_node === null) { throw new Error("check parent nodes for nulls by using the has_parent_node() call") }
        let parent = this.fc.get_node_by_id(this.parent_node.nodeId)
        if (parent === undefined) { throw new Error("check parent nodes for nulls by using the has_parent_node() call") }
        return parent
    }

    /**
     * Overwrites the members in this node.
     * @param {Member} members 
     */
    set_members(members: Array<Member>) {
        this.members = members;
    }

    /**
     * Returns the members contained in this node.
     */
    get_members() {
        return this.members;
    }

    /**
     * Adds the data object to this node. If the node is a leaf node, it ties to propagate the data up the tree.
     * @param {Member} member 
     */
    add_data(member: Member) {
        if (member.contents === null){ return }
        this.members.push(member);
        this.propagate_children_count(1)
    }
       
    /**
     * Adds the data object to this node.
     * @param {Member} member 
     */
    add_data_no_propagation(member: Member) {
        if (member.contents === null){ return }
        this.members.push(member);
    }
    
    /**
     * Helper method to transfer node information to a new node.
     * @param {Node} othernode 
     */
    copy_info(othernode: Node) {
        this.set_children(othernode.get_children())
        this.set_members(othernode.get_members())
        this.set_remainingItems(othernode.get_remainingItems())
    }

    get_only_child_with_relation(childRelation : ChildRelation) : Node | null {
        let children = this.get_children_with_relation(childRelation);
        if (children === null) { return null}
        if (children.length !== 1){ throw new Error("Binary tree may only hava a single child per relation")}
        return children[0];
    }
}