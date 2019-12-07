export class Identifier{
  nodeId : string;
  value : any

  constructor(nodeId : string, value : any){
    this.nodeId = nodeId;
    this.value = value
  }

  equals(identifier : Identifier){
    return (identifier.nodeId === this.nodeId)
  }
}