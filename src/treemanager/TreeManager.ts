import { TreeRepresentation } from "../treerepresentation/TreeRepresentation";
import { Tree } from '../Tree/Tree';
import TreeConfig from '../TreeConfig';
import { NodeIO } from '../IO/NodeIO';

export abstract class TreeManager {

  nodeIO : NodeIO | null = null;

  /** 
   * Gets the tree object from the given location.
   * @param {string} sourceDirectory - base folder of the tree data
   * @param {*} dataFolder - folder containing the fragment files in the sourceDirectory
   * @param {*} maxCachedFragments - maximal cachable fragments at once
   */
  readTree(location : string): TreeRepresentation {
    const fs = require('fs')
    if (! location.endsWith('config.json')) location = location + 'config.json'
    let config = JSON.parse(fs.readFileSync(location).toString())
    let tree = (this.getNodeIOObjectPrototype()).readTree(config, this.getTreeObjectPrototype(), this.getNodeIOObjectPrototype())
    return this.createTreeRepresentation(tree, config);
  }

  /**
   * Creates a new tree object.
   * @param {treeConfig} config - configuration object for the tree
   */

  createTree(config : TreeConfig): TreeRepresentation {
    return this.createTreeRepresentation(null, this.sanitizeConfig(config));
  }

  createTreeRepresentation(tree : Tree | null, config : TreeConfig): TreeRepresentation {
      let IOObject = this.getNodeIOObjectPrototype()
      let nodeIO = new IOObject(config)
      let treeRepresentationObjectPrototype = this.getTreeRepresentationObjectPrototype();
      return new treeRepresentationObjectPrototype(tree, config['rootDir'], config['dataDir'], config['memoryLimit'] || Infinity, config['fragmentSize'] || 50, nodeIO)
    }


  abstract getTreeRepresentationObjectPrototype(): any;

  abstract getTreeObjectPrototype(): any;

  protected getNodeIOObjectPrototype(): any { return NodeIO; }

  private sanitizeConfig(config : TreeConfig) : TreeConfig{
    if(!config['rootDir']) throw new Error('A "rootDir" parameter is required. This parameter indicates the root of the identifiers that are stored in the tree.')
    if(!config['dataDir']) throw new Error('A "dataDir" parameter is required. This parameter is the relative path to the "rootDir" where the fragments of the tree are stored.')
    if(!config['treePath']) throw new Error('A "treePath" parameter is required. This parameter sets the tree:path for all relations in the tree.')
    config['memoryLimit'] = config['memoryLimit'] || 100000000000;
    config['fragmentSize'] = config['fragmentSize'] || 50;
    config['writeMetadata'] = config['writeMetadata'] || true
    config['context'] = config['context'] || {};
    config['nodeCount'] = config['nodeCount'] || 0;
    if (!config['rootDir'].endsWith('/')) config['rootDir'] += '/'
    if (!config['dataDir'].endsWith('/')) config['dataDir'] += '/'
    if (config['dataDir'].startsWith('/')) config['dataDir'] = config['dataDir'].slice(1)
    return config
  }

}