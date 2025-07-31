//ps/adn-types.ts
/**
 * ActionDescriptor Navigator Type Definitions
 * 
 * Complete type definitions for ActionManager navigation with sentinel-based
 * error handling. Uses global ActionManager classes from index.d.ts.
 * 
 * REWRITTEN: Removed namespace architecture, uses global Adobe types directly
 * ENHANCED: Complete SENTINELS with file and reference support
 * 
 * @fileoverview Type definitions and constants for ActionManager navigation
 * @version 1.0.0
 */

// ===================================================================
// SENTINEL IMPLEMENTATIONS
// ===================================================================

/**
 * Minimal sentinel File implementation that returns safe defaults
 */
const SENTINEL_FILE: File = {
    absoluteURI: "",
    alias: false,
    created: new Date(0),
    creator: "",
    displayName: "",
    encoding: "",
    eof: true,
    error: "Sentinel file object",
    exists: false,
    fsName: "",
    fullName: "",
    hidden: false,
    length: 0,
    lineFeed: "unix",
    localizedName: "",
    modified: new Date(0),
    name: "",
    parent: null as any,
    path: "",
    readonly: true,
    relativeURI: "",
    type: "",

    // Essential methods (no-ops for sentinel)
    changePath: () => false,
    close: () => false,
    copy: () => false,
    createAlias: () => false,
    execute: () => false,
    getRelativeURI: () => "",
    open: () => false,
    openDialog: () => null,
    read: () => "",
    readch: () => "",
    readln: () => "",
    remove: () => false,
    rename: () => false,
    resolve: () => null,
    saveDialog: () => null,
    seek: () => false,
    tell: () => 0,
    write: () => false,
    writeln: () => false
} as File;

/**
 * Minimal sentinel ActionReference implementation
 */
const SENTINEL_REFERENCE: ActionReference = {
    // Put methods (no-ops for sentinel)
    putClass: () => {},
    putEnumerated: () => {},
    putIdentifier: () => {},
    putIndex: () => {},
    putName: () => {},
    putOffset: () => {},
    putProperty: () => {},

    // Get methods (return sentinel values)
    getDesiredClass: () => -1,
    getEnumeratedType: () => -1,
    getEnumeratedValue: () => -1,
    getForm: () => -1,
    getIdentifier: () => -1,
    getIndex: () => -1,
    getName: () => "",
    getOffset: () => -1,
    getProperty: () => -1,
    getContainer: (): ActionReference => SENTINEL_REFERENCE
} as ActionReference;

/**
 * Complete sentinel values for ActionManager operations
 * Used when operations fail to provide safe, non-crashing defaults
 * 
 * ENHANCED: Includes "file" and "reference" properties needed by ActionDescriptorNavigator
 */
export const SENTINELS = {
    "string": "",
    "integer": -1,
    "double": -1,
    "boolean": false,
    "file": SENTINEL_FILE,
    "reference": SENTINEL_REFERENCE
} as const;

// ===================================================================
// TYPE DEFINITIONS
// ===================================================================

/**
 * Function signature for filtering collections based on criteria
 */
export type PredicateFunction = (item: IActionDescriptorNavigator) => boolean;

/**
 * Function signature for transforming items during selection operations
 */
export type SelectorFunction<T = any> = (item: IActionDescriptorNavigator) => T;

// NOTE: Using Adobe's existing Rectangle class from index.d.ts instead of custom BoundsObject
// Rectangle has: left, top, right, bottom, width, height properties

// ===================================================================
// NAVIGATION INTERFACES
// ===================================================================

/**
 * Primary interface for navigating ActionDescriptor objects
 * Uses global Adobe types directly (no namespace dependencies)
 */
export interface IActionDescriptorNavigator {
    /** Indicates if this navigator represents a failed operation */
    readonly isSentinel: boolean;

    // Navigation methods
    getObject(key: string): IActionDescriptorNavigator;
    getList(key: string): IActionListNavigator;

    // Value extraction methods
    getString(key: string): string;
    getInteger(key: string): number;
    getDouble(key: string): number;
    getBoolean(key: string): boolean;
    getUnitDouble(key: string): number;
    getEnumerationString(key: string): string;
    getEnumerationId(key: string): number;

    // Advanced value methods
    getData(key: string): string;
    getClass(key: string): number;
    getLargeInteger(key: string): number;
    getObjectType(key: string): number;
    getUnitDoubleType(key: string): number;
    getUnitDoubleValue(key: string): number;
    getEnumerationType(key: string): number;
    getType(key: string): number;

    // File and reference methods (need sentinel support)
    getPath(key: string): File;
    getReference(key: string): ActionReference;

    // Utility methods
    getBounds(): Rectangle;  // Uses Adobe's existing Rectangle class
    hasKey(key: string): boolean;
    select<T>(selector: SelectorFunction<T>): T | null;
    debug(label: string): IActionDescriptorNavigator;
}

/**
 * Interface for navigating ActionList collections
 */
export interface IActionListNavigator {
    /** Indicates if this navigator represents a failed operation */
    readonly isSentinel: boolean;

    /** Get the number of items in this list */
    getCount(): number;

    // Collection filtering methods
    getFirstWhere(predicate: PredicateFunction): IActionDescriptorNavigator;
    getSingleWhere(predicate: PredicateFunction): IActionDescriptorNavigator;
    getAllWhere(predicate: PredicateFunction): IActionDescriptorNavigator[];

    // Collection transformation
    whereMatches(predicate: PredicateFunction): IEnumerable;
    select<T>(transformer: SelectorFunction<T>): IEnumerableArray;

    // Basic access
    getObject(index: number): IActionDescriptorNavigator;
    asEnumerable(): IEnumerable;
    debug(label: string): IActionListNavigator;
}

/**
 * Interface for enumerable collections (LINQ-style operations)
 */
export interface IEnumerable {
    whereMatches(predicate: PredicateFunction): IEnumerable;
    getFirst(): IActionDescriptorNavigator;
    hasAnyMatches(): boolean;
    getCount(): number;
    select<T>(transformer: SelectorFunction<T>): IEnumerableArray;
    toResultArray(): IActionDescriptorNavigator[];
    debug(label: string): IEnumerable;
}

/**
 * Interface for enumerable arrays (transformed collections)
 */
export interface IEnumerableArray {
    readonly array: any[];
    whereMatches(predicate: (item: any) => boolean): IEnumerableArray;
    getFirst(): any;
    getCount(): number;
    hasAnyMatches(): boolean;
    select<T>(transformer: (item: any) => T): IEnumerableArray;
    toResultArray(): any[];
    debug(label: string): IEnumerableArray;
}