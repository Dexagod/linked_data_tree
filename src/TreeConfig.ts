export default interface TreeConfig {
  'rootDir'        : string,
  'dataDir'        : string,
  'treePath'       : string,
  'fragmentSize'?  : number | undefined,
  'memoryLimit'?   : number | undefined,
  'writeMetadata'? : boolean | undefined,
  'context'?       : Object | undefined,
  'nodeCount' ?    : number | undefined,
}