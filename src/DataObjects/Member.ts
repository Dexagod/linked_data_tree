export class Member {
  representation: any;
  contents: any;
  size: number;

  /**
   * Creates a data object in the tree with a given representation.
   * @param {string} representation 
   * @param {any} contents 
   */
  constructor(representation: any, contents: any = null, size = 1){
    this.representation = representation;
    this.contents = contents;
    this.size = size;
  }
  
  /** 
   * returns the representation of this data object.
  */
  get_representation(){
    return this.representation;
  }
}
