import { TreeRepresentation } from './TreeRepresentation';
import { Cache } from '../Cache/Cache';
import { Tree } from '../Tree/Tree';
import { NGramTree } from '../Tree/NGramTree';

export class NGramTreeRepresentation extends TreeRepresentation{
  createNewTreeObject(maxFragmentSize : number, fc : Cache) : Tree{
    return new NGramTree(maxFragmentSize, fc);
  }

}