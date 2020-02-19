import { Member } from "../DataObjects/Member";
import { Node } from "../Node/Node";
import { ChildRelation } from '../Relations/ChildRelation';
import { Cache } from "../Cache/Cache";
import { Identifier } from '../Identifier';
import { Tree } from '../Tree/Tree';
import { Relation } from '../Relation';
export declare class NodeIO {
    sourceDirectory: string;
    dataFolder: string;
    shaclPath: any;
    writeMetadata: boolean;
    /**
     * Initialize the fragment IO managing object.
     * @param {string} sourceDirectory - The source directory where all data of this tree is stored.
     * @param {string} dataFolder - The subfolder of the source directory where the fragments are stored.
     */
    constructor(sourceDirectory: string, dataFolder: string, shaclPath: any, writeMetadata?: boolean);
    write_node_batch(nodeArray: Array<Node>): void;
    delete_node(nodeId: string): void;
    write_node(node: Node): void;
    read_node(nodeId: string, fc: Cache): any;
    writeTreeRoot(node: Node, tree: Tree): any;
    readTree(prototypeObject: any): any;
    encode_wrapper(encodedNode: any, encodedMembers: any, encodedMembersMetadata: any, totalItems?: number): {
        "@context": {
            "rdf": string;
            "rdfs": string;
            "foaf": string;
            "hydra": string;
            "tree": string;
            "schema": string;
            "value": string;
            "members": string;
            "children": string;
            "geo": string;
            "shacl": string;
            "ex": string;
        };
        "@id": string;
        "@type": string;
        "tree:remainingItems": number;
        "hydra:view": any;
        "hydra:member": any;
        "memberMetadata": any;
    } | {
        "@context": {
            "rdf": string;
            "rdfs": string;
            "foaf": string;
            "hydra": string;
            "tree": string;
            "schema": string;
            "value": string;
            "members": string;
            "children": string;
            "geo": string;
            "shacl": string;
            "ex": string;
        };
        "@id": string;
        "@type": string;
        "tree:remainingItems": number;
        "hydra:view": any;
        "hydra:member": any;
        "memberMetadata"?: undefined;
    };
    decode_wrapper(wrapper: any): any[];
    encode_node(node: Node): any;
    decode_node(node: any, members: any, membersMetadata: any, fc: Cache): any;
    encode_member(member: Member): any[];
    decode_member(member: any): Member;
    encode_relation(relation: Relation): {
        "@type": string;
        "tree:node": {
            "@id": string;
        };
        "shacl:path": string | null;
        "value": any;
    };
    decode_relation(childRelationObject: any): Relation;
    getCollectionId(): string;
    getNodeLocation(nodeId: string): string;
    getNodeIdFromIdentifier(nodeId: string): string;
    retrieveNodeIdentifier(str: string, value: any): Identifier;
    relationToString(relation: ChildRelation): string;
    stringToRelation(relationString: string): ChildRelation;
    encode_node_value(a: any): any;
    encode_tdo_value(a: any): any;
    decode_node_value(a: any): any;
    decode_tdo_value(a: any): any;
    getRootNodeIdentifier(): string;
}
