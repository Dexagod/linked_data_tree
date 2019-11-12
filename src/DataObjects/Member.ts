export class Member {
  representation: any;
  contents: any;

  /**
   * Creates a data object in the tree with a given representation.
   * @param {string} representation 
   * @param {any} contents 
   */
  constructor(representation: any, contents: any = null){
    this.representation = representation;
    this.contents = contents;
  }
  
  /** 
   * returns the representation of this data object.
  */
  get_representation(){
    return this.representation;
  }
}
