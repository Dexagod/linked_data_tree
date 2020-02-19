import { TreeRepresentation } from './TreeRepresentation';
import { Cache } from '../Cache/Cache';
import { Tree } from '../Tree/Tree';
import { BTree } from '../Tree/BTree';
import { Member } from '../DataObjects/Member';
import { Node } from '../Node/Node';

export class BTreeRepresentation extends TreeRepresentation{
  createNewTreeObject(maxFragmentSize : number, fc : Cache) : Tree{
    return new BTree(maxFragmentSize, fc);
  }

}