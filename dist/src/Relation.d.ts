import { ChildRelation } from './Relations/ChildRelation';
import { Identifier } from './Identifier';
export declare class Relation {
    type: ChildRelation;
    value: any;
    identifier: Identifier;
    constructor(type: ChildRelation, value: any, identifier: Identifier);
}
