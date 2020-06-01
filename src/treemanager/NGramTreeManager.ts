import { TreeManager } from './TreeManager';
import { NGramTreeRepresentation } from '../treerepresentation/NGramTreeRepresentation';
import { NGramTree } from '../Tree/NGramTree';

export class NGramTreeManager extends TreeManager{
  
  getTreeRepresentationObjectPrototype() : any{
    return NGramTreeRepresentation;
  }

  getTreeObjectPrototype() {
    return NGramTree;
  }
}