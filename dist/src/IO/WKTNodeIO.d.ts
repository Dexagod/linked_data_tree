import { NodeIO } from './NodeIO';
import * as terraformer from 'terraformer';
export declare class WKTNodeIO extends NodeIO {
    encode_node_value(a: terraformer.Polygon | Terraformer.Point): string;
    decode_node_value(a: string): any;
    encode_tdo_value(a: terraformer.Polygon | Terraformer.Point): string;
    decode_tdo_value(a: string): any;
}
