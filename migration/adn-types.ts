//ps/action-manager/adn-types.ts
/**
 * ActionDescriptor Navigator Type Definitions - Production Ready
 * 
 * Complete type definitions for ActionManager navigation with sentinel-based
 * error handling and full generic type safety throughout all operations.
 * 
 * ENHANCED: Full generic type system for enterprise TypeScript usage
 * FIXED: Consistent sentinel behavior - no null returns except file/path
 * IMPROVED: Type preservation through complex LINQ operations
 * STANDARDIZED: Consistent predicate and selector signatures
 * 
 * @fileoverview Production-ready type definitions with full generic support
 * @version 3.0.0
 */

// ===================================================================
// SENTINEL VALUES & CORE INTERFACES
// ===================================================================

/**
 * Sentinel values for ActionManager operations
 * Used when operations fail to provide safe, non-crashing defaults
 * 
 * SPECIFICATION: Only file/path operations return null, all others use primitives
 * LOGIC: -1 = "failed to get value", 0 = "no items found" (valid state)
 */
export const SENTINELS = {
    "string": "",
    "integer": -1,
    "double": -1,
    "boolean": false,
    "file": null as File | null,
    "reference": null as ActionReference | null
} as const;

/**
 * Core interface for sentinel behavior
 * Provides consistent sentinel detection across all navigator types
 */
export interface ISentinel {
    /** Indicates if this navigator represents a failed operation */
    readonly isSentinel: boolean;
}

// ===================================================================
// ENHANCED TYPE DEFINITIONS WITH GENERICS
// ===================================================================

/**
 * Function signature for filtering collections based on criteria
 * Standardized across all enumerable types
 */
export type PredicateFunction = (item: IActionDescriptorNavigator) => boolean;

/**
 * Function signature for transforming items during selection operations
 * ENHANCED: Supports optional index parameter and proper generic constraints
 */
export type SelectorFunction<T = any> = (item: IActionDescriptorNavigator, index?: number) => T;

/**
 * Predicate function for transformed collections (any type)
 * Used by IEnumerableArray for filtering transformed data
 */
export type TransformedPredicateFunction<T = any> = (item: T) => boolean;

/**
 * Transformer function for nested transformations
 * Used by IEnumerableArray for chaining transformations
 */
export type TransformerFunction<T = any, U = any> = (item: T, index?: number) => U;

// ===================================================================
// ENHANCED NAVIGATION INTERFACES
// ===================================================================

/**
 * Primary interface for navigating ActionDescriptor objects
 * ENHANCED: Proper generic support and consistent sentinel behavior
 * FIXED: getBounds() returns Bounds, never returns null except file/path
 */
export interface IActionDescriptorNavigator extends ISentinel {
    // Navigation methods - always return sentinels on failure
    getObject(key: string): IActionDescriptorNavigator;
    getList(key: string): IActionListNavigator;

    // Value extraction methods - return sentinel values on failure
    getString(key: string): string;
    getInteger(key: string): number;
    getDouble(key: string): number;
    getBoolean(key: string): boolean;
    getUnitDouble(key: string): number;
    getEnumerationString(key: string): string;
    getEnumerationId(key: string): number;

    // Advanced value methods - return sentinel values on failure
    getData(key: string): string;
    getClass(key: string): number;
    getLargeInteger(key: string): number;
    getObjectType(key: string): number;
    getUnitDoubleType(key: string): number;
    getUnitDoubleValue(key: string): number;
    getEnumerationType(key: string): number;
    getType(key: string): number;

    // File and reference methods - EXCEPTION: Return null on failure (as specified)
    getPath(key: string): File | null;
    getReference(key: string): ActionReference | null;

    // Utility methods - return sentinel or proper type
    getBounds(): Bounds;  // Returns proper Bounds object or sentinel equivalent
    hasKey(key: string): boolean;
    select<T>(selector: SelectorFunction<T>): T | null;  // Single item selection
    debug(label: string): IActionDescriptorNavigator;
}

/**
 * Enhanced interface for navigating ActionList collections
 * ENHANCED: Full generic support with type preservation
 */
export interface IActionListNavigator extends ISentinel {
    /** Get the number of items in this list - returns 0 for empty, not -1 */
    getCount(): number;

    // Collection filtering methods - return sentinels on failure, never null
    getFirstWhere(predicate: PredicateFunction): IActionDescriptorNavigator;
    getSingleWhere(predicate: PredicateFunction): IActionDescriptorNavigator;
    getAllWhere(predicate: PredicateFunction): IActionDescriptorNavigator[];

    // Collection transformation with proper generics
    whereMatches(predicate: PredicateFunction): IEnumerable;
    select<T>(transformer: SelectorFunction<T>): IEnumerableArray<T>;

    // ✅ ADD THIS NEW METHOD:
    /**
     * Combines selection and filtering in a single operation for improved performance and readability.
     * Transforms each item in the list using the selector function, then immediately filters
     * the results using the predicate function, returning only items that match the criteria.
     * 
     * @template T The type of objects to be created by the selector function
     * @param selector Function that transforms each ActionDescriptorNavigator into type T
     * @param predicate Function that tests each transformed object against filter criteria
     * @returns IEnumerableArray<T> containing only the transformed objects that pass the predicate
     * 
     * @example
     * ```typescript
     * // Find textStyles with specific font and size
     * const matchingStyles = layer.getObject('textKey')
     *     .getList('textStyleRange')
     *     .selectWhere(
     *         // Selector: Extract properties of interest
     *         range => {
     *             const textStyle = range.getObject('textStyle');
     *             const color = textStyle.getObject('color');
     *             return {
     *                 fontName: textStyle.getString('fontName'),
     *                 fontSize: textStyle.getUnitDouble('impliedFontSize'),
     *                 fillColorRed: color.getDouble('red'),
     *                 from: range.getInteger('from'),
     *                 to: range.getInteger('to')
     *             };
     *         },
     *         // Predicate: Filter for matching criteria
     *         style => {
     *             return style.fontName === "Arial" &&
     *                    Math.abs(style.fontSize - 24) < 0.1 &&
     *                    style.fillColorRed > 200 &&
     *                    style.fontName !== SENTINELS.string;
     *         }
     *     )
     *     .toResultArray();
     * 
     * // Result: Array of objects with only Arial, ~24pt, reddish styles
     * if (matchingStyles.length > 0) {
     *     console.log(`Found ${matchingStyles.length} matching text styles`);
     *     const firstMatch = matchingStyles[0];
     *     console.log(`Using font: ${firstMatch.fontName} at ${firstMatch.fontSize}pt`);
     * }
     * ```
     * 
     * @example
     * ```typescript
     * // Find layers with specific bounds and opacity
     * const suitableLayers = document.getList('layers')
     *     .selectWhere(
     *         layer => ({
     *             name: layer.getString('name'),
     *             opacity: layer.getInteger('opacity'),
     *             width: layer.getObject('bounds').getUnitDouble('width'),
     *             height: layer.getObject('bounds').getUnitDouble('height')
     *         }),
     *         layer => {
     *             const hasValidBounds = layer.width > 100 && layer.height > 100;
     *             const hasGoodOpacity = layer.opacity >= 80;
     *             const hasValidName = layer.name !== SENTINELS.string && layer.name.length > 0;
     *             return hasValidBounds && hasGoodOpacity && hasValidName;
     *         }
     *     )
     *     .toResultArray();
     * ```
     * 
     * @since 3.1.0
     */
    selectWhere<T>(selector: SelectorFunction<T>, predicate: TransformedPredicateFunction<T>): IEnumerableArray<T>;

    // Basic access - returns sentinels on failure
    getObject(index: number): IActionDescriptorNavigator;
    asEnumerable(): IEnumerable;
    debug(label: string): IActionListNavigator;
}

/**
 * Enhanced interface for enumerable collections (LINQ-style operations)
 * ENHANCED: Proper generic support with type preservation through chains
 */
export interface IEnumerable extends ISentinel {
    // Filtering operations
    whereMatches(predicate: PredicateFunction): IEnumerable;

    // Access operations - return sentinels, never null
    getFirst(): IActionDescriptorNavigator;
    hasAnyMatches(): boolean;
    getCount(): number;

    // Transformation operations with full generic support
    select<T>(transformer: SelectorFunction<T>): IEnumerableArray<T>;

    // Materialization operations
    toResultArray(): IActionDescriptorNavigator[];
    debug(label: string): IEnumerable;
}

/**
 * Enhanced interface for enumerable arrays (transformed collections)
 * FULLY GENERIC: Maintains type information through all operations
 * ENHANCED: Comprehensive method chaining with type safety
 */
export interface IEnumerableArray<T = any> extends ISentinel {
    /** Direct access to the underlying typed array */
    readonly array: T[];

    // Filtering operations with proper typing
    whereMatches(predicate: TransformedPredicateFunction<T>): IEnumerableArray<T>;

    // Access operations - follow sentinel pattern except where null makes sense
    // getFirst(): T | null;  // Can return null for empty arrays of transformed data
    getCount(): number;
    hasAnyMatches(): boolean;

    // Transformation operations with full generic support
    select<U>(transformer: TransformerFunction<T, U>): IEnumerableArray<U>;

    // Materialization operations
    toResultArray(): T[];
    debug(label: string): IEnumerableArray<T>;
}

// ===================================================================
// ENHANCED DEBUGGING INTERFACES
// ===================================================================

/**
 * Enhanced debugging information with type context
 */
export interface IDebugInfo {
    label: string;
    type: string;
    isSentinel: boolean;
    itemCount?: number;
    arrayType?: string;
    chainDepth?: number;
}

/**
 * Interface for objects that provide enhanced debugging
 */
export interface IEnhancedDebuggable extends ISentinel {
    getDebugInfo(label: string): IDebugInfo;
    debug(label: string): this;
}

// ===================================================================
// TYPE VALIDATION HELPERS
// ===================================================================

/**
 * Type guard for checking if a value is a sentinel
 */
export function isSentinel(value: any): value is ISentinel {
    return value && typeof value === 'object' && 'isSentinel' in value && value.isSentinel === true;
}

/**
 * Type guard for checking if an array contains only sentinels
 */
export function isAllSentinels(items: ISentinel[]): boolean {
    return items.every(item => item.isSentinel);
}

/**
 * Helper type for extracting the generic parameter from IEnumerableArray
 */
export type ExtractArrayType<T> = T extends IEnumerableArray<infer U> ? U : never;

/**
 * Helper type for method chaining validation
 */
export type ChainableMethod<T, R> = (this: T) => R;

// ===================================================================
// RUNTIME TYPE VALIDATION (OPTIONAL)
// ===================================================================

/**
 * Runtime type validation for development/debugging
 */
export interface ITypeValidator {
    validateChain<T>(operation: string, input: any, output: T): T;
    validateTransformation<T, U>(input: T[], output: U[], transformer: TransformerFunction<T, U>): U[];
    validateSentinelPropagation(operations: string[]): boolean;
}

/**
 * Configuration for type validation behavior
 */
export interface IValidationConfig {
    enableRuntimeChecks: boolean;
    logTypeTransitions: boolean;
    validateChainIntegrity: boolean;
    throwOnTypeErrors: boolean;
}