import { Tree } from "../Tree/Tree";
import { ChildRelation } from '../Relations/ChildRelation';
import { Member } from '../DataObjects/Member';
import { Cache } from "../Cache/Cache";
import { Identifier } from '../Identifier';
import { Relation } from '../Relation';
export declare class Node {
    identifier: Identifier;
    members: Array<Member>;
    children: Array<Relation>;
    parent_node: Identifier | null;
    fc: Cache;
    remainingItems: number;
    constructor(value: any, parent_node: Node | null, tree: Tree);
    get_identifier(): Identifier;
    get_node_id(): number;
    get_parent_node_identifier(): Identifier | null;
    add_child_no_propagation(childRelation: ChildRelation, childNode: Node, value: any): void;
    add_child(childRelation: ChildRelation, node: Node, value: any): void;
    add_child_with_relation(relation: Relation, node: Node): void;
    add_child_no_propagation_with_relation(relation: Relation, childNode: Node): void;
    get_total_member_count(): number;
    set_remainingItems(count: number): void;
    fix_total_member_count(): void;
    has_child_relations(): boolean;
    propagate_children_count(increment: number): void;
    getRelations(): Array<Relation>;
    remove_child(node: Node): void;
    swapChildren(oldChild: Node, relations: Array<ChildRelation>, newChildren: Array<Node>, values: Array<any>): void;
    swapChildrenWithRelation(oldChild: Node, relations: Array<Relation>, newChildren: Array<Node>): void;
    clear(): void;
    clearChildren(): void;
    get_children_identifiers_with_relation(childRelation: ChildRelation): Array<Identifier> | null;
    get_children_with_relation(childRelation: ChildRelation): Array<Node> | null;
    update_child(oldIdentifier: Identifier, newIdentifier: Identifier): void;
    get_children_objects(): Array<Node>;
    get_child_by_value(value: any): Node | null;
    set_children(new_children: Array<Relation>): void;
    /**
     * Private method
     * Updates all child nodes with the new fragment of the parent node.
     */
    update_children(): void;
    get_children(): Array<Relation>;
    deleteMembers(): void;
    /**
     * Sets the parent node.nex
     * @param {Node} node
     */
    set_parent_node(node: Node | null): void;
    /**
     * Returns if this node has a parent node.
     * If this is not the case, this is the root node.
     */
    has_parent_node(): boolean;
    /**
     * returns the parent node.
     */
    get_parent_node(): Node;
    /**
     * Overwrites the members in this node.
     * @param {Member} members
     */
    set_members(members: Array<Member>): void;
    /**
     * Returns the members contained in this node.
     */
    get_members(): Member[];
    /**
     * Adds the data object to this node. If the node is a leaf node, it ties to propagate the data up the tree.
     * @param {Member} member
     */
    add_data(member: Member): void;
    /**
     * Helper method to transfer node information to a new node.
     * @param {Node} othernode
     */
    copy_info(othernode: Node): void;
    get_only_child_with_relation(childRelation: ChildRelation): Node | null;
}
