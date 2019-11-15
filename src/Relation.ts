import { ChildRelation } from './Relations/ChildRelation';
import { Identifier } from './Identifier';
export class Relation{
  
  type : ChildRelation;
  value : any;
  identifier : Identifier;

  constructor(type : ChildRelation, value : any, identifier : Identifier){
    this.type = type;
    this.value = value;
    this.identifier = identifier;
  }

}