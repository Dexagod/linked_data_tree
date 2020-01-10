export declare class Member {
    representation: any;
    contents: any;
    size: number;
    /**
     * Creates a data object in the tree with a given representation.
     * @param {string} representation
     * @param {any} contents
     */
    constructor(representation: any, contents?: any, size?: number);
    /**
     * returns the representation of this data object.
    */
    get_representation(): any;
}
