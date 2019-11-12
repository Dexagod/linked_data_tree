import { Tree } from './Tree';
import { Member } from '../DataObjects/Member';
import { Node } from '../Node/Node';
import { ChildRelation } from '../Relations/ChildRelation';
export class PrefixTree extends Tree {/**
  * Adds the given data to the tree.
  * @param {Member} member 
  */
 addData(representation : any, member : Member) : Node | null{
  if(this.node_count === 0) {
    this.createFirstNode("", null)
  }
   let node = this.get_root_node();
   let repr = representation
   // Check for invalid object.
   // Object must have a representation.
   if (repr == "" || repr == null){
     return null;
   }

   // Iterate the tree lettergroup per lettergroup.
   let index = 0
   while (index < repr.length) {
     // Check if the node has a child node containing the next letter
     let children_identifiers = node.get_children_identifiers_with_relation(ChildRelation.StringCompletesRelation);
     let found_child = false;
     if (children_identifiers != null && children_identifiers.length !== 0) {
       // This node contains children
       // All children are iterated and checked for a match with the given word.
       for (var i = 0; i < children_identifiers.length; i++) {
         let letter = repr[index];

         // The character array of the currently looked at child.
         let current_child_identifier = children_identifiers[i];
         let current_child_value : string = current_child_identifier.value;

         // Iterate over all the letters in the childs character array
         let child_tokens_length = current_child_value.length;
         let child_node_match_length = 0
         for (child_node_match_length;
           (child_node_match_length < child_tokens_length && current_child_value[child_node_match_length] === letter); child_node_match_length++) {
             //(current_child_value[child_node_match_length] === letter)   &&   (current_child_value[child_node_match_length].localeCompare(letter, this.options.locale) === 0)
             // This code gave errors? 
             // TODO:: check this for correct behaviour and implement using the the localcompare
           index += 1
           letter = repr[index];
         }
         // Checking if a total match was found.
         if (child_node_match_length === child_tokens_length) {
           // A total match was found
           found_child = true;
           node = this.total_matching_child_node(node, current_child_value);
           break;
         } else if (child_node_match_length > 0) {
           // A partial match was found
           found_child = true;
           node = this.partial_matching_child_node(representation, node, current_child_value, child_node_match_length, index, member);
           node.add_data(member);
           return node
         }
       }
       if (found_child !== true) {
         // No match was found
         node = this.no_matching_child_node(representation, node, index, member);
         node.add_data(member);
         return node
       }

     } else {
       // This node contains no children
       node = this.no_matching_child_node(representation, node, index, member);
       node.add_data(member);
       return node
     }

   }
   node.add_data(member);
   return node;
 }

 // 
 /**
  * No matching nodes were found.
  * In the node we add a new child containing the member.
  * All propagations of totalitems and suggestions are executed automatically.
  * @param {Node} node 
  * @param {number} index 
  * @param {Member} member 
  */
  private no_matching_child_node(representation : any, node : Node, index : number, member : Member) {
   let repr = representation
   let string = "";
   // Construct the substring for the new node.
   for (var i = index; i < repr.length; i++) {
     string += repr.charAt(i)
   }

   // Create the new node.
   let child = new Node(string, node, this)

   // Add the child to the node.
   node.add_child(ChildRelation.StringCompletesRelation, child);
   // Add the child to the fragment.
   return child;
 }

 /**
  * A node has been partially matched with the currently searched substring of the searchword.
  * This method changes the node that matches partly into two nodes, and adds a new node on the place untill where they matched
  * This new node will be the node containing the given member and is returned.
  * @param {Node} parent_node 
  * @param {string} child_value 
  * @param {number} nodeindex 
  * @param {number} memberindex 
  * @param {Member} member 
  */
 partial_matching_child_node(representation : any, parent_node : Node, child_value : string, nodeindex : number, memberindex : number, member : Member) {
   let node = parent_node.get_child_by_value(child_value);
   if (node === null){
     throw new Error("Requesting child with non existing value")
   }
   let root_parent = node.get_parent_node();

   // The strings for the three new nodes, one parent node with two child nodes.
   let before_string_match = node.get_value().slice(0, nodeindex)
   let after_string_match = node.get_value().slice(nodeindex, node.get_value().length)
   let after_member_match = representation.slice(memberindex, representation.length)

   // Make sure the two child nodes are not equal - DEBUG TEST
   if (after_string_match === after_member_match) {
     throw new Error("partial matching child function received a fully matching child");
   }

   if (memberindex !== representation.length) {
     // The searched word is not yet completed, a new path should be added

     // Create the new three nodes
     let root_node = new Node(before_string_match, null, this)
     let old_match_node = new Node(after_string_match, root_node, this)
     let new_match_node = new Node(after_member_match, root_node, this)
     
     // old children are transfered to the child node that leads to these children (and member as well)
     old_match_node.copy_info(node);

     // Replace node with three new nodes
     // Fix because of percolating children counts

     root_node.add_child(ChildRelation.StringCompletesRelation, old_match_node)
     root_node.add_child(ChildRelation.StringCompletesRelation, new_match_node)
     root_parent.swapChildren(node, [root_node], ChildRelation.StringCompletesRelation)

     return new_match_node;

   } else {
     // The searched word has been found, the node must be split so it can point to the member
     let root_node = new Node(before_string_match, null, this)
     let old_match_node = new Node(after_string_match, root_node, this)

     // old children are transfered to the child node that leads to these children
     old_match_node.copy_info(node);

     // Replace node with three new nodes
     // Fix because of percolating children counts

     root_node.add_child(ChildRelation.StringCompletesRelation, old_match_node)
     root_parent.swapChildren(node, [root_node], ChildRelation.StringCompletesRelation)
     return root_node;
   }
 }

 /**
  * The node containing this representation already existed and the node is returned.
  * The dataobject is added to the node in the calling method (addData).
  * @param {Node} node 
  * @param {string} child_value 
  */
 total_matching_child_node(node : Node, child_value : any) : Node{
   let matching_node = node.get_child_by_value(child_value);
   if (matching_node === null){ throw new Error("requesting non existing child node from node") }
   return matching_node
 }

 /**
  * The given dataobject is searched in the tree.
  * For testing and debugging purposes.
  * @param {DataObject} searched_member 
  */
 searchData(value : any) {
   let node = this.get_root_node();
   let current_index = 0;
   while (current_index < value.length) {
     let found = false;
     let node_children = node.get_children_objects();
     for (var i = 0; i < node_children.length; i++) {
       let child = node_children[i]
       let child_token_len = child.get_value().length;
       let representation_substring = value.substring(current_index, current_index+child_token_len)
       if (child.get_value() === representation_substring) {
         found = true;
         node = child;
         current_index += child.get_value().length
         break;
       }
     }
     if (!found) {
       let strng = "The word " + value + " was not present in the tree."
       throw new Error(strng)
     }
   }
   return node.get_members()
 }

}

