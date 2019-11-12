export class Identifier{
  nodeId : number;
  value : any

  constructor(nodeId : number, value : any){
    this.nodeId = nodeId;
    this.value = value
  }

  equals(identifier : Identifier){
    return (identifier.nodeId === this.nodeId)
  }
}