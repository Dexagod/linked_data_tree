import { PrefixTree } from '../Tree/PrefixTree';
import { TreeRepresentation } from './TreeRepresentation';
import { Member } from '../DataObjects/Member';
import { Node } from '../Node/Node';
export class PrefixTreeRepresentation extends TreeRepresentation{

  createNewTreeObject(maxFragmentSize: number, fc: any) {
    return new PrefixTree(maxFragmentSize, fc)
  }

  addData(representation: any, data: any, dataRepresentation : any = representation) : Node | null{
    let splitOnSpace = true
    representation = this.customNormalizer(representation)
    let node = null
    if (splitOnSpace){
      let spaceSeparatedRepresentations = representation.split(" ")
      for (let i = 0; i < spaceSeparatedRepresentations.length; i++){
        let rep = spaceSeparatedRepresentations.slice(i).join(" ")
        // this.tree.addData(rep, new Member(dataRepresentation, data))
        node = this.tree.addData(rep, new Member(rep, data))
        if (node === null || node === undefined) { console.error("Could not add", rep); return null }
      }
    }
    return node
  }
  
}