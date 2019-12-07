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

  addData(representation: any, data: any, dataRepresentation : any = representation) : Node | null {
    return this.tree.addData(representation, new Member(dataRepresentation, data))
  }
}