import { PrefixTree } from '../Tree/PrefixTree';
import { TreeRepresentation } from './TreeRepresentation';
import { Member } from '../DataObjects/Member';
export class PrefixTreeRepresentation extends TreeRepresentation{

  createNewTreeObject(maxFragmentSize: number, fc: any) {
    return new PrefixTree(maxFragmentSize, fc)
  }

  addData(representation: any, data: any, dataRepresentation : any = representation) {
    let splitOnSpace = true
    representation = this.customNormalizer(representation)
    if (splitOnSpace){
      let spaceSeparatedRepresentations = representation.split(" ")
      for (let i = 0; i < spaceSeparatedRepresentations.length; i++){
        let rep = spaceSeparatedRepresentations.slice(i).join(" ")
        this.tree.addData(rep, new Member(dataRepresentation, data))
      }
    }
  }
  
}