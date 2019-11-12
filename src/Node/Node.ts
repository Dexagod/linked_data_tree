import { Tree } from "../Tree/Tree";
import { ChildRelation } from '../Relations/ChildRelation';
import { Member } from '../DataObjects/Member';
import { Cache } from "../Cache/Cache";
import { Identifier } from '../Identifier';

export class Node {

    identifier : Identifier;
    value: any;
    members: Array < Member > ;
    children: Map < ChildRelation, Array < Identifier >> ; // M&p <relation, [fragmentId, nodeId]>
    
    parent_node:  Identifier| null;
    fc: Cache;
    total_children_count: number;


    constructor(value: any, parent_node: Node | null, tree: Tree) {
        this.identifier = new Identifier(tree.provide_node_id(), value);
        this.value = value;
        this.members = new Array();
        this.children = new Map();
        // Initialize the fragment cache from the given tree.
        this.fc = tree.get_cache();
        if (parent_node !== null) {
            this.parent_node = parent_node.get_identifier();
        } else {
            this.parent_node = null;
        }
        this.total_children_count = 0;
        tree.addNode(this)
    }

    get_identifier() : Identifier{
        return this.identifier;
    }

    get_node_id(): number{
        return this.identifier.nodeId;
    }

    get_parent_node_identifier(): Identifier | null {
        return this.parent_node;
    }

    set_value(value : any) {
        this.value = value;
        this.identifier.value = value;
        if (this.has_parent_node()){
            let oldIdentifier = this.get_identifier();
            let newIdentifier = new Identifier(oldIdentifier.nodeId, value)
            this.get_parent_node().update_child(oldIdentifier, newIdentifier)
        }   
    }

    // This function adds a child node to this node.
    // The parent node is set upon creation
    // This method does not propagate the new information in the node. Needed when replacing an old node for multiple new nodes.
    add_child_no_propagation(childRelation: ChildRelation, childNode: Node) {
        let updatedChildrenArray = this.children.get(childRelation)
        if (updatedChildrenArray === undefined || updatedChildrenArray === null) {
            updatedChildrenArray = [childNode.get_identifier()]
        } else {
            updatedChildrenArray.push(childNode.get_identifier())
        }
        this.children.set(childRelation, updatedChildrenArray);
        childNode.set_parent_node(this);
    }

    // Add a child node to this node and propagate the new information.
    add_child(childRelation: ChildRelation, node: Node) {
        this.add_child_no_propagation(childRelation, node);
        this.propagate_children_count(node.get_total_children_count() + 1)
    }

    // Return the total amount of children under this node.
    get_total_children_count() {
        return this.total_children_count;
    }

    set_total_children_count(count: number) {
        this.total_children_count = count;
    }

    has_child_relations() : boolean {
        return this.children.size > 0;
    }

    propagate_children_count(increment: number) {
        this.total_children_count += increment;
        if (this.has_parent_node()) {
            this.get_parent_node().propagate_children_count(increment)
        }
    }

    // Removes a child node from this node
    // Compares on value so no need for the same Node object
    remove_child(node: Node) {

        let toRemoveIndex : number | null = null
        let toRemoveRelation  : ChildRelation | null = null

        this.children.forEach((identifierArray: Array < Identifier > , childRelation: ChildRelation) => {
            identifierArray.forEach((identifier, index) => {
                if (identifier.equals(node.get_identifier())){
                    toRemoveIndex = index;
                    toRemoveRelation = childRelation
                    
                }
            });
        });;
        
        if (toRemoveIndex !== null && toRemoveRelation !== null) {
            let removeRelationChildren = this.children.get(toRemoveRelation);
            if (removeRelationChildren === undefined) { throw new Error ('childrelation returned undefined while trying to remove child node from node')}
            removeRelationChildren.splice(toRemoveIndex, 1)
            this.children.set(toRemoveRelation, removeRelationChildren)

            if (removeRelationChildren.length === 0){
                this.children.delete(toRemoveRelation);
            }

            return
        } else {
            console.error("Trying to remove non-existing child node");
        }
    }

    swapChildren(oldChild : Node, newChildren : Array<Node>, childRelation : ChildRelation){
        let newChildrenCount = 0
        for (let child of newChildren){
            newChildrenCount += child.get_total_children_count() + 1
        }

        let oldChildrenCount = oldChild.get_total_children_count() + 1
        let childCountDifference = newChildrenCount - oldChildrenCount
        this.remove_child(oldChild);
        
        for (let child of newChildren){
            this.add_child_no_propagation(childRelation, child);
        }
        this.propagate_children_count(childCountDifference);

    }

    clear(){
        this.members = new Array();
        this.children = new Map();
        this.value = null;
        this.parent_node = null;
        this.total_children_count = 0;
    }
    
    clearChildren(){
        this.children = new Map();
    }

    get_children_identifiers_with_relation(childRelation: ChildRelation): Array<Identifier> | null {
        if (!this.children.has(childRelation)) {
            return null;
        }
        let childrenIdentifiersWithRelation = this.children.get(childRelation);
        if (childrenIdentifiersWithRelation === undefined) { throw new Error(" ChildRelation returns undefined instead of children items ")}
            
        return childrenIdentifiersWithRelation;
    }


    get_children_with_relation(childRelation: ChildRelation): Array<Node> | null {
        if (!this.children.has(childRelation)) {
            return null;
        }
        let childrenIdentifiersWithRelation = this.children.get(childRelation);
        if (childrenIdentifiersWithRelation === undefined) { throw new Error(" ChildRelation returns undefined instead of children items ")}
        let childrenArray = new Array<Node>();
        for (let identifier of childrenIdentifiersWithRelation){
            childrenArray.push(this.fc.get_node(identifier))
        }
        
        return childrenArray;
    }

    // Updates the child node.
    // Used when child changes fragment, so the parent needs to update the child fragment id in its children.
    update_child(oldIdentifier : Identifier, newIdentifier : Identifier) {
        this.children.forEach((identifierArray: Array < Identifier > , key: ChildRelation) => {
            identifierArray.forEach((identifier, index) => {
                if (identifier.equals(oldIdentifier)){
                    identifierArray[index] = newIdentifier;
                    return;
                }
            });
        });
    }

    // Returns the objects of all children for iteration purposes.
    get_children_objects(): Array<Node> {
        let fc = this.fc
        let childrenObjects = new Array<Node>();
        let vals = this.children.values()
        let nextRelation = vals.next()
        while(nextRelation.done === false){
            for (let identifier of nextRelation.value){
                childrenObjects.push( fc.get_node(identifier) )
            }
            nextRelation = vals.next();
        }
        return childrenObjects;
    }

    get_child_by_value(value : any) : Node | null{
        let vals = this.children.values()
        let nextRelation = vals.next()
        while(nextRelation.done === false){
            for (let identifier of nextRelation.value){
                if (identifier.value === value){
                    return this.fc.get_node(identifier)
                }
            }
            nextRelation = vals.next();
        }
        return null;
    }

    // Returns the amount of children this node has.
    get_child_count(): number {
        return Object.keys(this.children).length;
    }

    // Set the children of this node
    // Destructive function!
    // Use only when transfering children from existing node to a newly created node
    set_children(new_children: Map<ChildRelation, Array<Identifier>>) {
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
    get_children() : Map<ChildRelation, Array<Identifier>> {
        return this.children;
    }
    
    /**
     * Returns the value of this node.
     */
    get_value() {
        return this.value;
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
    }
    
    /**
     * Helper method to transfer node information to a new node.
     * @param {Node} othernode 
     */
    copy_info(othernode: Node) {
        this.set_children(othernode.get_children())
        this.set_members(othernode.get_members())
        this.set_total_children_count(othernode.get_total_children_count())
    }

    get_only_child_with_relation(childRelation : ChildRelation) : Node | null {
        let children = this.get_children_with_relation(childRelation);
        if (children === null) { return null}
        if (children.length !== 1){ throw new Error("Binary tree may only hava a single child per relation")}
        return children[0];
    }
}