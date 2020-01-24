import { TreeRepresentation } from './TreeRepresentation';
import { Cache } from '../Cache/Cache';
import { Tree } from '../Tree/Tree';
import { RTree } from '../Tree/RTree';
import { Member } from '../DataObjects/Member';
import * as terraformer_parser from 'terraformer-wkt-parser';
import { Node } from '../Node/Node';

export class RTreeRepresentation extends TreeRepresentation{

  createNewTreeObject(maxFragmentSize : number, fc : Cache) : Tree{
    return new RTree(maxFragmentSize, fc);
  }
  
  addData(representation: any, data: any, triplesSize: number = 1, dataRepresentation : any = representation) : Node | null {
    representation = terraformer_parser.parse(representation)
    dataRepresentation = terraformer_parser.parse(dataRepresentation)
    return this.tree.addData(representation, new Member(dataRepresentation, data, triplesSize))
  }
  
  searchData(value: any) : Member[] | null{
    return this.tree.searchData(terraformer_parser.parse(value))
}

}