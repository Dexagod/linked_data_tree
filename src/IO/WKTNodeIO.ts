import { NodeIO } from './NodeIO';
import * as terraformer from 'terraformer';
import * as terraformer_parser from 'terraformer-wkt-parser';

export class WKTNodeIO extends NodeIO {
  encode_node_value(a : terraformer.Polygon | Terraformer.Point){
    return terraformer_parser.convert(a)
  }

  decode_node_value(a : string) : any{
    return terraformer_parser.parse(a)
  }

  encode_tdo_value(a : terraformer.Polygon | Terraformer.Point){
    return terraformer_parser.convert(a)
  }

  decode_tdo_value(a : string) : any {
    return terraformer_parser.parse(a)
  }
}