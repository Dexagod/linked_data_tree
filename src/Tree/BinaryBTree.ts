import { Tree } from './Tree';
import { Member } from '../DataObjects/Member';
import { Node } from '../Node/Node';
import { ChildRelation } from '../Relations/ChildRelation';


export class BinaryBTree extends Tree {

  /**
     * Adds the given data to the tree.
     * @param {Member} member 
     */
    addData(representation : any, member: Member) : Node | null{
      if(this.node_count === 0) {
          return this.createFirstNode(representation, member);
      }
      let repr = representation;
      // Check for invalid object.
      // Object must have a representation.
      if (repr == "" || repr == null) {
          return null;
      }
      // Iterate the tree lettergroup per lettergroup.
      let node = this.get_root_node();
      let newnode : Node | null = node;
      while (newnode !== null) {
          node = newnode;
          // Check if the node has a child node containing the next letter
          let comparison = repr.localeCompare(node.get_value())
          if (comparison > 0) {
              newnode = node.get_only_child_with_relation(ChildRelation.GreaterThanRelation)
          } else if(comparison === 0) {
              break;
          } else {
              newnode = node.get_only_child_with_relation(ChildRelation.LesserThanRelation)
          }

      }

      if (repr.localeCompare(node.get_value()) > 0) {
          node = this.addChildNode(ChildRelation.GreaterThanRelation, node, repr);
      } else if (repr.localeCompare(node.get_value()) < 0){
          node = this.addChildNode(ChildRelation.LesserThanRelation, node, repr);
      }

      node.add_data(member);
      return node;
  }

  addChildNode(relation: ChildRelation, parent: Node, repr: string) {
      let childnode = new Node(repr, parent, this);
      parent.add_child(relation, childnode);
      return childnode;
  }


  /**
   * The given dataobject is searched in the tree.
   * For testing and debugging purposes.
   * @param {DataObject} searched_member 
   */
  searchData(value : any) : Array<Member> | null{
      let representation = value;
      let node: Node = this.get_root_node();
      let newNode: Node | null = node;
      while (newNode !== null && newNode.get_value() !== value){
          node = newNode;
          if (representation.localeCompare(node.get_value()) < 0){
              newNode = node.get_only_child_with_relation(ChildRelation.LesserThanRelation)
          } else {
              newNode = node.get_only_child_with_relation(ChildRelation.GreaterThanRelation)
          }
      }
      if (newNode !== null){
          node = newNode;
      }
      return node.get_members()
  }
}
