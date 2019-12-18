import { PrefixTree } from '../Tree/PrefixTree';
import { TreeRepresentation } from './TreeRepresentation';
import { Member } from '../DataObjects/Member';
import { Node } from '../Node/Node';
import { HydraPartialCollectionView } from '../Tree/HydraPartialCollectionView';
export class HydraPartialCollectionViewRepresentation extends TreeRepresentation{

  createNewTreeObject(maxFragmentSize: number, fc: any) {
    return new HydraPartialCollectionView(maxFragmentSize, fc)
  }

  addData(representation: any, data: any, dataRepresentation : any = representation) : Node | null{
    return this.tree.addData(representation, new Member(dataRepresentation, data))
  }
  
}