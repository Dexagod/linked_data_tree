import { ChildRelation } from './Relations/ChildRelation';
import { Identifier } from './Identifier';
export class Relation{
  
  type : ChildRelation;
  value : any;
  identifier : Identifier;
  path : string | undefined;
  remainingItems: number | undefined;

  constructor(type : ChildRelation, value : any, identifier : Identifier, path?: string, remainingItems?: number){
    this.type = type;
    this.value = value;
    this.identifier = identifier;
    this.path = path;
    this.remainingItems = remainingItems;
  }

}