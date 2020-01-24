import { PrefixTree } from '../Tree/PrefixTree';
import { TreeRepresentation } from './TreeRepresentation';
export class PrefixTreeRepresentation extends TreeRepresentation{

  createNewTreeObject(maxFragmentSize: number, fc: any) {
    return new PrefixTree(maxFragmentSize, fc)
  }
  
}