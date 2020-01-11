import { TreeRepresentation } from './TreeRepresentation';
import { Cache } from '../Cache/Cache';
import { Tree } from '../Tree/Tree';
import { BinaryBTree } from '../Tree/BinaryBTree';
import { Member } from '../DataObjects/Member';
import { Node } from '../Node/Node';

export class BinaryBTreeRepresentation extends TreeRepresentation{
  createNewTreeObject(maxFragmentSize : number, fc : Cache) : Tree{
    return new BinaryBTree(maxFragmentSize, fc);
  }

}