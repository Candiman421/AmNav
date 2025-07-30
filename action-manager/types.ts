//ps/action-manager/types.ts
/**
 * Adobe ExtendScript ActionManager Navigator - Complete Type Definitions
 * 
 * Provides fluent, chainable interface for navigating Photoshop's ActionManager API
 * with automatic performance optimization, sentinel-based error handling, and 
 * criteria-based selection patterns.
 * 
 * NAMESPACE INTEGRATED: Uses ActionManagerGlobals from globals.d.ts to prevent conflicts.
 * 
 * @fileoverview Core type definitions for ActionManager navigation system
 * @version 1.0.0
 * @author ActionManager Navigator Team
 * @license MIT
 * 
 * @example Best - Modern fluent navigation
 * ```typescript
 * import { ActionDescriptorNavigator } from '../ps/action-manager';
 * 
 * const layer = ActionDescriptorNavigator.forCurrentLayer();
 * const textStyles = layer
 *   .getObject('textKey')
 *   .getList('textStyleRange')
 *   .whereMatches(range => range.getInteger('from') === 0)
 *   .select(range => ({
 *     fontName: range.getObject('textStyle').getString('fontPostScriptName'),
 *     fontSize: range.getObject('textStyle').getUnitDouble('sizeKey')
 *   }));
 * ```
 */

// Import ExtendScript globals (using our safe declarations)
/// <reference path="./globals.d.ts" />
//import type {} from './globals.d.ts';
/**
 * NAMESPACE TYPE EXPORTS
 * 
 * Export ActionManager types from the ActionManagerGlobals namespace
 * to maintain isolation while providing clean import syntax.
 * This prevents conflicts with work framework's ps-patch.d.ts.
 */
export type ActionDescriptor = ActionManagerGlobals.ActionDescriptor;
export type ActionList = ActionManagerGlobals.ActionList;
export type ActionReference = ActionManagerGlobals.ActionReference;
export type ExtendScriptFile = ActionManagerGlobals.ExtendScriptFile;
export type Folder = ActionManagerGlobals.Folder;
export type UnitValue = ActionManagerGlobals.UnitValue;

/**
 * Valid ActionManager value types for property extraction
 * 
 * @example Best - Type-safe property access
 * ```typescript
 * // Each method returns the appropriate type
 * const name: string = layer.getString('name');           // ValueType: 'string'
 * const opacity: number = layer.getInteger('opacity');    // ValueType: 'integer'
 * const visible: boolean = layer.getBoolean('visible');   // ValueType: 'boolean'
 * ```
 */
export type ValueType = 'string' | 'integer' | 'double' | 'boolean' | 'enumerated';

/**
 * Sentinel value mapping for each ActionManager value type.
 * Used when operations fail to provide safe, non-crashing defaults.
 * 
 * @example Straightforward - Sentinel handling
 * ```typescript
 * const fontSize = textStyle.getDouble('sizeKey');
 * if (fontSize === SENTINELS.double) {
 *   // Handle failed operation gracefully
 *   console.log('Font size not available');
 * }
 * ```
 */
export type SentinelValue<T extends ValueType> =
    T extends 'string' | 'enumerated' ? "" :
    T extends 'integer' | 'double' ? -1 :
    T extends 'boolean' ? false :
    never;

/**
 * Sentinel value constants for graceful error handling.
 * These values are returned instead of throwing exceptions when operations fail.
 * Updated to use ActionManagerGlobals namespace types.
 * 
 * @example Good - Checking for sentinel values
 * ```typescript
 * const layerName = layer.getString('name');
 * if (layerName !== SENTINELS.string) {
 *   // Safe to use layerName
 *   console.log('Layer name:', layerName);
 * }
 * 
 * const bounds = layer.getBounds();
 * if (hasValidBounds(bounds)) {
 *   // Safe to use bounds calculations
 *   const area = bounds.width * bounds.height;
 * }
 * 
 * // File and reference sentinels
 * const linkedFile = layer.getPath('linkedAsset');
 * if (linkedFile !== SENTINELS.file) {
 *   const content = linkedFile.read();
 * }
 * 
 * const reference = layer.getReference('someProperty');
 * if (reference !== SENTINELS.reference) {
 *   reference.putProperty(someClassID, somePropertyID);
 * }
 * ```
 * 
 * @example Incorrect - Assuming values are valid
 * ```typescript
 * // BAD - Could crash if layer has no name
 * const name = layer.getString('name').toUpperCase();
 * 
 * // BAD - Could crash if bounds are invalid
 * const area = layer.getBounds().width * layer.getBounds().height;
 * 
 * // BAD - Could crash if file is sentinel
 * const content = layer.getPath('asset').read();  // Crashes if sentinel
 * ```
 */
export interface SentinelValueMap {
    readonly "string": "";
    readonly "enumerated": "";
    readonly "integer": -1;
    readonly "double": -1;
    readonly "boolean": false;
    readonly "file": ExtendScriptFile;        
    readonly "reference": ActionReference;   
}

/**
 * Sentinel ExtendScriptFile implementation using namespace type
 */
const SENTINEL_FILE: ExtendScriptFile = {
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
    
    changePath: () => false,
    close: () => false,
    copy: () => false,
    createAlias: () => false,
    execute: () => false,
    getRelativeURI: () => "",
    open: () => false,
    openDlg: () => null,
    read: () => "",
    readch: () => "",
    readln: () => "",
    remove: () => false,
    rename: () => false,
    resolve: () => null,
    saveDlg: () => null,
    seek: () => false,
    tell: () => 0,
    write: () => false,
    writeln: () => false
} as ExtendScriptFile;

/**
 * Sentinel ActionReference implementation using namespace type
 */
const SENTINEL_REFERENCE: ActionReference = {
    putClass: () => {},
    putEnumerated: () => {},
    putIdentifier: () => {},
    putIndex: () => {},
    putName: () => {},
    putOffset: () => {},
    putProperty: () => {},
    
    getDesiredClass: () => -1,
    getEnumeratedType: () => -1,
    getEnumeratedValue: () => -1,
    getForm: () => -1,
    getIdentifier: () => -1,
    getIndex: () => -1,
    getName: () => "",
    getOffset: () => -1,
    getProperty: () => -1,
    getContainer: () => SENTINEL_REFERENCE
} as ActionReference;

/**
 * Sentinel values used throughout the system for graceful error handling.
 * Never returns null or undefined - always returns safe default values.
 */
export const SENTINELS: SentinelValueMap = {
    "string": "",
    "enumerated": "",
    "integer": -1,
    "double": -1,
    "boolean": false,
    "file": SENTINEL_FILE,
    "reference": SENTINEL_REFERENCE
} as const;

/**
 * Function signature for filtering collections based on criteria.
 * Used with whereMatches() methods for criteria-based selection.
 * 
 * @param item - The item to evaluate
 * @returns true if item matches criteria, false otherwise
 * 
 * @example Best - Criteria-based text style filtering
 * ```typescript
 * // Find bold text ranges
 * .whereMatches(range => 
 *   range.getObject('textStyle').getBoolean('syntheticBold') === true
 * )
 * 
 * // Find large font sizes
 * .whereMatches(range => 
 *   range.getObject('textStyle').getUnitDouble('sizeKey') > 24
 * )
 * 
 * // Find specific font families
 * .whereMatches(range => 
 *   range.getObject('textStyle').getString('fontPostScriptName').includes('Arial')
 * )
 * ```
 */
export type PredicateFunction = (item: any) => boolean;

/**
 * Function signature for transforming items during selection operations.
 * Used with select() methods to project data into desired shapes.
 * 
 * @param item - The item to transform
 * @returns The transformed item
 * 
 * @example Best - Comprehensive text style extraction
 * ```typescript
 * .select(range => ({
 *   // Character range info
 *   from: range.getInteger('from'),
 *   to: range.getInteger('to'),
 *   
 *   // Font properties
 *   fontName: range.getObject('textStyle').getString('fontPostScriptName'),
 *   fontSize: range.getObject('textStyle').getUnitDouble('sizeKey'),
 *   fontCaps: range.getObject('textStyle').getEnumerationString('fontCaps'),
 *   
 *   // Style properties
 *   isBold: range.getObject('textStyle').getBoolean('syntheticBold'),
 *   isItalic: range.getObject('textStyle').getBoolean('syntheticItalic'),
 *   
 *   // Color information
 *   color: {
 *     red: range.getObject('textStyle').getObject('color').getDouble('red'),
 *     green: range.getObject('textStyle').getObject('color').getDouble('green'),
 *     blue: range.getObject('textStyle').getObject('color').getDouble('blue')
 *   },
 *   
 *   // Layout properties
 *   horizontalScale: range.getObject('textStyle').getDouble('horizontalScale'),
 *   tracking: range.getObject('textStyle').getInteger('tracking')
 * }))
 * ```
 */
export type SelectorFunction<T> = (item: any) => T;

/**
 * Bounds information for Photoshop layers and objects.
 * All measurements are in document units (typically pixels).
 * 
 * @example Best - Bounds calculations
 * ```typescript
 * const layer = ActionDescriptorNavigator.forCurrentLayer();
 * const bounds = layer.getBounds();
 * 
 * if (hasValidBounds(bounds)) {
 *   const centerX = bounds.left + (bounds.width / 2);
 *   const centerY = bounds.top + (bounds.height / 2);
 *   const area = bounds.width * bounds.height;
 *   const aspectRatio = bounds.width / bounds.height;
 *   
 *   console.log(`Layer size: ${bounds.width} x ${bounds.height}`);
 *   console.log(`Layer center: (${centerX}, ${centerY})`);
 * }
 * ```
 */
export interface BoundsObject {
    readonly left: number;
    readonly top: number;
    readonly right: number;
    readonly bottom: number;
    readonly width: number;
    readonly height: number;
}

/**
 * Validates if bounds object contains valid, non-sentinel values.
 * 
 * @param bounds - The bounds object to validate
 * @returns true if bounds are valid (not sentinel values)
 * 
 * @example Straightforward - Bounds validation
 * ```typescript
 * const bounds = layer.getBounds();
 * if (hasValidBounds(bounds)) {
 *   // Safe to use bounds for calculations
 *   const isWide = bounds.width > bounds.height;
 *   const isLarge = bounds.width > 500 && bounds.height > 500;
 * } else {
 *   console.log('Layer has no valid bounds');
 * }
 * ```
 */
export function hasValidBounds(bounds: BoundsObject): boolean {
    return bounds.left !== -1 && bounds.top !== -1 &&
        bounds.width > 0 && bounds.height > 0;
}

/**
 * Primary interface for navigating ActionDescriptor objects.
 * Provides chainable, fluent API for traversing Photoshop's object hierarchy.
 * 
 * Key Features:
 * - Automatic API call caching for performance
 * - Sentinel-based error handling (never crashes)
 * - Direct function calls (no string method names)
 * - Chainable operations throughout
 * 
 * @example Best - Complete text analysis workflow
 * ```typescript
 * import { ActionDescriptorNavigator } from '../ps/action-manager';
 * 
 * const layer = ActionDescriptorNavigator.forCurrentLayer();
 * 
 * // Extract all text formatting information
 * const textAnalysis = layer
 *   .getObject('textKey')
 *   .getList('textStyleRange')
 *   .select(range => ({
 *     from: range.getInteger('from'),
 *     to: range.getInteger('to'),
 *     style: {
 *       font: range.getObject('textStyle').getString('fontPostScriptName'),
 *       size: range.getObject('textStyle').getUnitDouble('sizeKey'),
 *       bold: range.getObject('textStyle').getBoolean('syntheticBold'),
 *       color: range.getObject('textStyle').getObject('color')
 *     }
 *   }))
 *   .toResultArray();
 * ```
 */
export interface IActionDescriptorNavigator {
    /** 
     * Indicates if this navigator represents a failed operation.
     * When true, all operations return sentinel values.
     */
    readonly isSentinel: boolean;

    /**
     * Navigate to a child object within this descriptor.
     * 
     * @param key - Property name using camelCase (e.g., 'textKey', 'textStyle')
     * @returns Navigator for the child object, or sentinel if not found
     */
    getObject(key: string): IActionDescriptorNavigator;

    /**
     * Navigate to a list collection within this descriptor.
     * 
     * @param key - Property name using camelCase
     * @returns Navigator for the list, or sentinel if not found
     */
    getList(key: string): IActionListNavigator;

    /**
     * Extract string value from this descriptor.
     * 
     * @param key - Property name using camelCase  
     * @returns String value, or empty string ("") if failed
     */
    getString(key: string): string;

    /**
     * Extract double/number value from this descriptor.
     * 
     * @param key - Property name using camelCase
     * @returns Numeric value, or -1 if failed
     */
    getDouble(key: string): number;

    /**
     * Extract unit double value (measurements with units).
     * 
     * @param key - Property name using camelCase
     * @returns Numeric value in document units, or -1 if failed
     */
    getUnitDouble(key: string): number;

    /**
     * Extract integer value from this descriptor.
     * 
     * @param key - Property name using camelCase
     * @returns Integer value, or -1 if failed
     */
    getInteger(key: string): number;

    /**
     * Extract boolean value from this descriptor.
     * 
     * @param key - Property name using camelCase
     * @returns Boolean value, or false if failed
     */
    getBoolean(key: string): boolean;

    /**
     * Extract enumeration value as string from this descriptor.
     * 
     * @param key - Property name using camelCase
     * @returns Enumeration string, or empty string ("") if failed
     */
    getEnumerationString(key: string): string;

    /**
     * Extract enumeration value as numeric ID.
     * 
     * @param key - Property name using camelCase
     * @returns Enumeration ID, or -1 if failed
     */
    getEnumerationId(key: string): number;

    /** Extract raw data value */
    getData(key: string): string;

    /** Extract class ID */
    getClass(key: string): number;

    /** Extract large integer value */
    getLargeInteger(key: string): number;

    /** Extract object type ID */
    getObjectType(key: string): number;

    /** Extract file path reference - uses namespace type */
    getPath(key: string): ExtendScriptFile;

    /** Extract ActionReference object - uses namespace type */
    getReference(key: string): ActionReference;

    /** Extract unit double type ID */
    getUnitDoubleType(key: string): number;

    /** Extract unit double value */
    getUnitDoubleValue(key: string): number;

    /** Extract enumeration type ID */
    getEnumerationType(key: string): number;

    /** Extract property type ID */
    getType(key: string): number;

    /**
     * Check if this descriptor contains the specified property.
     * 
     * @param key - Property name to check
     * @returns true if property exists, false otherwise
     */
    hasKey(key: string): boolean;

    /**
     * Extract bounds/rectangle information from this descriptor.
     * 
     * @returns Bounds object with calculated width/height, or sentinel values if failed
     */
    getBounds(): BoundsObject;

    /**
     * Transform this descriptor using a custom selector function.
     * 
     * @param selector - Function to transform the descriptor
     * @returns Transformed result, or null if failed
     */
    select<T>(selector: SelectorFunction<T>): T | null;

    /**
     * Add debug information to the chain without breaking it.
     * 
     * @param label - Debug label to identify this step
     * @returns Same navigator for continued chaining
     */
    debug(label: string): IActionDescriptorNavigator;
}

/**
 * Interface for navigating ActionList collections.
 * Provides LINQ-style querying with automatic performance optimization.
 */
export interface IActionListNavigator {
    /** Indicates if this navigator represents a failed operation */
    readonly isSentinel: boolean;

    /**
     * Get the number of items in this list.
     * 
     * @returns Item count, or -1 if failed
     */
    getCount(): number;

    /**
     * Get item at specific index (use only when index is certain).
     * 
     * @param index - Zero-based index
     * @returns Navigator for the item, or sentinel if out of bounds
     */
    getObject(index: number): IActionDescriptorNavigator;

    /**
     * Find first item matching criteria (PREFERRED approach).
     * 
     * @param predicate - Function to test each item
     * @returns First matching item, or sentinel if none found
     */
    getFirstWhere(predicate: PredicateFunction): IActionDescriptorNavigator;

    /**
     * Find exactly one item matching criteria, fail if 0 or multiple found.
     * 
     * @param predicate - Function to test each item
     * @returns The single matching item, or sentinel if 0 or multiple found
     */
    getSingleWhere(predicate: PredicateFunction): IActionDescriptorNavigator;

    /**
     * Find ALL items matching criteria - returns array directly (BEST for analysis).
     * 
     * @param predicate - Function to test each item
     * @returns Array of all matching items (empty array if none found)
     */
    getAllWhere(predicate: PredicateFunction): IActionDescriptorNavigator[];

    /**
     * Filter items by criteria (returns chainable collection).
     * 
     * @param predicate - Function to test each item
     * @returns Chainable enumerable for further filtering/transformation
     */
    whereMatches(predicate: PredicateFunction): IEnumerable;

    /**
     * Transform items using selector function (returns chainable array).
     * 
     * @param transformer - Function to transform each item
     * @returns Chainable enumerable array for further operations
     */
    select<T>(transformer: SelectorFunction<T>): IEnumerableArray;

    /**
     * Convert to enumerable for complex operations (usually not needed).
     * 
     * @returns Enumerable wrapper for advanced operations
     */
    asEnumerable(): IEnumerable;

    /**
     * Add debug information without breaking the chain.
     * 
     * @param label - Debug label
     * @returns Same navigator for continued chaining
     */
    debug(label: string): IActionListNavigator;
}

/**
 * Interface for LINQ-style enumerable collections of ActionDescriptors.
 * Supports lazy evaluation with automatic performance optimization.
 */
export interface IEnumerable {
    /**
     * Filter items by criteria.
     * 
     * @param predicate - Function to test each item
     * @returns New enumerable with filtered items
     */
    whereMatches(predicate: PredicateFunction): IEnumerable;

    /**
     * Get first item from filtered results.
     * 
     * @returns First item, or sentinel if none found
     */
    getFirst(): IActionDescriptorNavigator;

    /**
     * Check if any items match current filters.
     * 
     * @returns true if any items exist, false otherwise
     */
    hasAnyMatches(): boolean;

    /**
     * Count items matching current filters.
     * 
     * @returns Number of matching items
     */
    getCount(): number;

    /**
     * Materialize results into array (terminal operation).
     * 
     * @returns Array of matching ActionDescriptor navigators
     */
    toResultArray(): IActionDescriptorNavigator[];

    /**
     * Transform items and continue chaining.
     * 
     * @param transformer - Function to transform each item
     * @returns Chainable enumerable array
     */
    select<T>(transformer: SelectorFunction<T>): IEnumerableArray;

    /**
     * Add debug information.
     * 
     * @param label - Debug label
     * @returns Same enumerable for continued chaining
     */
    debug(label: string): IEnumerable;
}

/**
 * Interface for chainable arrays supporting continued filtering and transformation.
 * Maintains lazy evaluation until terminal operations.
 */
export interface IEnumerableArray {
    /** Raw array access (avoid using directly) */
    readonly array: any[];

    /**
     * Continue filtering after transformation.
     * 
     * @param predicate - Function to test each transformed item
     * @returns New enumerable array with filtered items
     */
    whereMatches(predicate: (item: any) => boolean): IEnumerableArray;

    /**
     * Get first item from current results.
     * 
     * @returns First item, or null if none found
     */
    getFirst(): any;

    /**
     * Count current items.
     * 
     * @returns Number of items
     */
    getCount(): number;

    /**
     * Check if any items exist.
     * 
     * @returns true if items exist, false otherwise
     */
    hasAnyMatches(): boolean;

    /**
     * Materialize results into plain array (terminal operation).
     * 
     * @returns Plain JavaScript array with all transformed items
     */
    toResultArray(): any[];

    /**
     * Continue transforming items.
     * 
     * @param transformer - Function to transform each item
     * @returns New enumerable array with transformed items
     */
    select<T>(transformer: (item: any) => T): IEnumerableArray;

    /**
     * Add debug information.
     * 
     * @param label - Debug label
     * @returns Same enumerable array for continued chaining
     */
    debug(label: string): IEnumerableArray;
}

/**
 * Properties extracted from text style information.
 * These match ActionManager property names (camelCase).
 */
export interface FontStyleProperties {
    readonly fontName: string;
    readonly fontPostScriptName: string;
    readonly fontSize: number;
    readonly horizontalScale: number;
    readonly verticalScale: number;
    readonly tracking: number;
    readonly autoKern: string;
    readonly fontCaps: string;
    readonly syntheticBold: boolean;
    readonly syntheticItalic: boolean;
    readonly autoLeading: boolean;
}

/**
 * RGB color values extracted from ActionManager.
 * Values are typically in the range 0-255.
 */
export interface ColorProperties {
    readonly red: number;
    readonly green: number;
    readonly blue: number;
}

/**
 * Text warp transformation properties.
 */
export interface WarpProperties {
    readonly warpStyle: string;
    readonly warpValue: number;
    readonly warpPerspective: number;
    readonly warpRotate: string;
}

/**
 * Basic layer properties commonly needed for analysis.
 */
export interface LayerProperties {
    readonly name: string;
    readonly opacity: number;
    readonly visible: boolean;
    readonly mode: string;
    readonly layerID: number;
    readonly itemIndex: number;
    readonly bounds: BoundsObject;
    readonly hasTextKey: boolean;
    readonly isBackground: boolean;
    readonly isLocked: boolean;
}

/**
 * Check if a file is a sentinel (failed operation).
 * 
 * @param file - File to check
 * @returns true if file is sentinel
 */
export function isSentinelFile(file: ExtendScriptFile): boolean {
    return file === SENTINELS.file || !file.exists;
}

/**
 * Check if a reference is a sentinel (failed operation).
 * 
 * @param reference - Reference to check  
 * @returns true if reference is sentinel
 */
export function isSentinelReference(reference: ActionReference): boolean {
    return reference === SENTINELS.reference;
}

/**
 * Simplified font data for scoring/analysis.
 */
export type FontDataProjection = {
    name: string;
    size: number;
    bold: boolean;
    caps: string;
};

/**
 * Simplified color data for scoring/analysis.
 */
export type ColorDataProjection = {
    red: number;
    green: number;
    blue: number;
};

/**
 * Combined text style data for scoring/analysis.
 */
export type TextStyleProjection = {
    fontName: string;
    fontSize: number;
    fontCaps: string;
    syntheticBold: boolean;
    color: ColorDataProjection;
};

/**
 * Type guard to validate ActionManager value types.
 * 
 * @param type - Value to test
 * @returns true if valid ValueType
 */
export function isValidValueType(type: any): type is ValueType {
    return typeof type === 'string' &&
        ['string', 'integer', 'double', 'boolean', 'enumerated'].includes(type);
}

/**
 * Check if a value represents a sentinel (failed operation).
 * 
 * @param value - Value to test
 * @param type - Expected value type
 * @returns true if value is the sentinel for this type
 */
export function isSentinelValue(value: any, type: ValueType): boolean {
    switch (type) {
        case 'string':
        case 'enumerated':
            return value === '';
        case 'integer':
        case 'double':
            return value === -1;
        case 'boolean':
            return value === false;
        default:
            return false;
    }
}

/**
 * Type guard for ActionDescriptorNavigator interface.
 * 
 * @param obj - Object to test
 * @returns true if object implements IActionDescriptorNavigator
 */
export function isActionDescriptorNavigator(obj: any): obj is IActionDescriptorNavigator {
    return obj && typeof obj.getObject === 'function' && typeof obj.getString === 'function';
}

/**
 * Type guard for ActionListNavigator interface.
 * 
 * @param obj - Object to test
 * @returns true if object implements IActionListNavigator
 */
export function isActionListNavigator(obj: any): obj is IActionListNavigator {
    return obj && typeof obj.getCount === 'function' && typeof obj.asEnumerable === 'function';
}