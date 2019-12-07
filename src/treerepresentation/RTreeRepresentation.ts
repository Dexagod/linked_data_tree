import { TreeRepresentation } from './TreeRepresentation';
import { Cache } from '../Cache/Cache';
import { Tree } from '../Tree/Tree';
import { RTree } from '../Tree/RTree';
import { Member } from '../DataObjects/Member';
import * as terraformer_parser from 'terraformer-wkt-parser';

export class RTreeRepresentation extends TreeRepresentation{
  createNewTreeObject(maxFragmentSize : number, fc : Cache) : Tree{
    return new RTree(maxFragmentSize, fc);
  }
  
  addData(representation: any, data: any, dataRepresentation = representation) {
    representation = terraformer_parser.parse(representation)
    dataRepresentation = terraformer_parser.parse(dataRepresentation)
    let newmember = new Member(dataRepresentation, data)
    this.tree.addData(representation, newmember)
  }
}