//ps/action-manager/adn-types.ts
/**
 * ActionDescriptor Navigator Type Definitions
 * 
 * Complete type definitions for ActionManager navigation with sentinel-based
 * error handling. Uses Adobe's built-in types directly for maximum simplicity.
 * 
 * SIMPLIFIED: Uses Adobe's global types directly - no namespace complexity
 * ENHANCED: Complete SENTINELS with simple null values
 * FIXED: getBounds() now returns Bounds instead of Rectangle
 * 
 * @fileoverview Type definitions and constants for ActionManager navigation
 * @version 2.1.0
 */

// ===================================================================
// SENTINEL VALUES
// ===================================================================

/**
 * Simple sentinel values for ActionManager operations
 * Used when operations fail to provide safe, non-crashing defaults
 * 
 * SIMPLIFIED: Uses null for complex objects, primitive values for simple types
 */
export const SENTINELS = {
    "string": "",
    "integer": -1,
    "double": -1,
    "boolean": false,
    "file": null as File | null,
    "reference": null as ActionReference | null
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

// ===================================================================
// NAVIGATION INTERFACES
// ===================================================================

/**
 * Primary interface for navigating ActionDescriptor objects
 * Uses Adobe's built-in types directly for maximum compatibility
 * 
 * FIXED: getBounds() now returns Bounds instead of Rectangle
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

    // File and reference methods - SIMPLIFIED: Use Adobe types directly
    getPath(key: string): File | null;              // Adobe's File type + null
    getReference(key: string): ActionReference | null; // Adobe's ActionReference + null

    // Utility methods - FIXED: getBounds() now returns Bounds
    getBounds(): Bounds;  // FIXED: Changed from Rectangle to Bounds
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