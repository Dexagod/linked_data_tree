import { ChildRelation } from './Relations/ChildRelation';
import { Identifier } from './Identifier';
export class Relation{
  
  type : ChildRelation;
  value : any;
  identifier : Identifier;
  path : string | null;

  constructor(type : ChildRelation, value : any, identifier : Identifier, path : string | null = null){
    this.type = type;
    this.value = value;
    this.identifier = identifier;
    this.path = path;
  }

}