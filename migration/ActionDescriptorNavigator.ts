//ps/action-manager/ActionDescriptorNavigator.ts
/**
 * ActionDescriptor Navigator - Production Ready Implementation
 * 
 * Clean, composable API for navigating Photoshop's ActionManager with sentinel-based 
 * error handling and complete type safety through all operations.
 * Never crashes - always returns safe sentinel values on errors.
 * 
 * ENHANCED: Full generic type system for production TypeScript usage
 * FIXED: Consistent sentinel behavior - no null returns except file/path
 * IMPROVED: Type preservation through complex LINQ operations
 * OPTIMIZED: Consistent API patterns and error handling
 * 
 * @fileoverview Production-ready ActionManager navigation with full type safety
 * @version 3.0.0
 * 
 * @example Enhanced - Natural caching with full type safety
 * ```typescript
 * import { ActionDescriptorNavigator } from './action-manager/ActionDescriptorNavigator';
 * 
 * // 1. Travel down hierarchy with type safety
 * const titleLayer = ActionDescriptorNavigator.forLayerByName('Title');
 * const textObj = titleLayer.getObject('textKey');
 * 
 * // 2. Chain with full generic support
 * const styleRanges = textObj.getList('textStyleRange');
 * 
 * // 3. Complex transformations with preserved typing
 * interface FontInfo { name: string; size: number; index: number; }
 * const fontData = styleRanges
 *   .select<FontInfo>((range, index) => ({
 *     name: range.getObject('textStyle').getString('fontPostScriptName'),
 *     size: range.getObject('textStyle').getUnitDouble('sizeKey'),
 *     index: index || 0
 *   }))
 *   .whereMatches(font => font.size > 12)
 *   .toResultArray(); // TypeScript knows this is FontInfo[]
 * 
 * // 4. No type assertions needed - full inference
 * fontData.forEach(font => {
 *   console.log(font.name, font.size); // All properly typed
 * });
 * ```
 */

// Import core functions from framework
import {
    executeActionGet,
    stringIDToTypeID,
    charIDToTypeID,
    typeIDToStringID
} from '../ps';

// Import enhanced types and constants
import {
    SENTINELS,
    ISentinel,
    IActionDescriptorNavigator,
    IActionListNavigator,
    IEnumerable,
    IEnumerableArray,
    PredicateFunction,
    SelectorFunction,
    TransformedPredicateFunction,
    TransformerFunction,
    isSentinel
} from './adn-types';

// NOTE: Bounds, ActionDescriptor, ActionReference, ActionList, File are all global Adobe classes

// ===================================================================
// ENHANCED ENUMERABLE SUPPORT CLASSES WITH FULL GENERICS
// ===================================================================

/**
 * Enhanced enumerable for sophisticated filtering and transformations
 * ENHANCED: Consistent sentinel behavior throughout all operations
 * FIXED: Proper type preservation and error handling
 */
class SimpleEnumerable implements IEnumerable {
    private items: IActionDescriptorNavigator[];

    constructor(items: IActionDescriptorNavigator[]) {
        this.items = items || [];
    }

    get isSentinel(): boolean {
        return false; // Enumerables are never sentinels themselves
    }

    whereMatches(predicate: PredicateFunction): IEnumerable {
        const filtered = this.items.filter(item => {
            if (item.isSentinel) return false;
            try {
                return predicate(item);
            } catch (e: any) {
                return false;
            }
        });
        return new SimpleEnumerable(filtered);
    }

    getFirst(): IActionDescriptorNavigator {
        // FIXED: Always return sentinel, never null
        return this.items.length > 0 ? this.items[0] : ActionDescriptorNavigator.createSentinel();
    }

    hasAnyMatches(): boolean {
        return this.items.length > 0;
    }

    getCount(): number {
        return this.items.length;
    }

    select<T>(transformer: SelectorFunction<T>): IEnumerableArray<T> {
        const transformed: T[] = [];

        this.items.forEach((item, index) => {
            if (!item.isSentinel) {
                try {
                    const result = transformer(item, index);
                    if (result !== null && result !== undefined) {
                        transformed.push(result);
                    }
                } catch (e: any) {
                    // Skip items that fail transformation
                }
            }
        });

        return new SimpleEnumerableArray<T>(transformed);
    }

    toResultArray(): IActionDescriptorNavigator[] {
        return [...this.items];
    }

    debug(label: string): IEnumerable {
        console.log(`[${label}] Enumerable with ${this.items.length} items`);
        return this;
    }
}

/**
 * Enhanced enumerable array for transformed collections
 * FULLY GENERIC: Maintains complete type information through all operations
 * ENHANCED: Proper error handling and sentinel behavior
 */
class SimpleEnumerableArray<T = any> implements IEnumerableArray<T> {
    readonly array: T[];

    constructor(items: T[]) {
        // ENHANCED: Proper input validation and type safety
        this.array = Array.isArray(items) ? items.filter(item => item !== null && item !== undefined) : [];
    }

    get isSentinel(): boolean {
        return false; // EnumerableArrays are never sentinels themselves
    }

    whereMatches(predicate: TransformedPredicateFunction<T>): IEnumerableArray<T> {
        const filtered = this.array.filter(item => {
            try {
                return predicate(item);
            } catch (e: any) {
                return false;
            }
        });
        return new SimpleEnumerableArray<T>(filtered);
    }

    // getFirst(): T | null {
    //     // EXCEPTION: Transformed arrays can return null for empty state
    //     return this.array.length > 0 ? this.array[0] : null;
    // }

    getCount(): number {
        return this.array.length;
    }

    hasAnyMatches(): boolean {
        return this.array.length > 0;
    }

    select<U>(transformer: TransformerFunction<T, U>): IEnumerableArray<U> {
        const transformed: U[] = [];

        this.array.forEach((item, index) => {
            try {
                const result = transformer(item, index);
                if (result !== null && result !== undefined) {
                    transformed.push(result);
                }
            } catch (e: any) {
                // Skip items that fail transformation
            }
        });

        return new SimpleEnumerableArray<U>(transformed);
    }

    toResultArray(): T[] {
        return [...this.array];
    }

    debug(label: string): IEnumerableArray<T> {
        console.log(`[${label}] EnumerableArray<${typeof this.array[0]}> with ${this.array.length} items`);
        return this;
    }
}

// ===================================================================
// ENHANCED LIST NAVIGATOR IMPLEMENTATION
// ===================================================================

/**
 * Enhanced ActionList navigator with superior enumerable support
 * ENHANCED: Full generic support and consistent sentinel behavior
 */
class ActionListNavigator implements IActionListNavigator {
    private list: ActionList | null;
    private _isSentinel: boolean;

    constructor(list: ActionList | null, isSentinel: boolean = false) {
        this.list = list;
        this._isSentinel = isSentinel || !list;
    }

    get isSentinel(): boolean {
        return this._isSentinel;
    }

    getCount(): number {
        if (this._isSentinel || !this.list) {
            return 0; // CORRECT: 0 items is valid state, -1 would be error
        }

        try {
            return this.list.count || 0;
        } catch (e: any) {
            return 0;
        }
    }

    getObject(index: number): IActionDescriptorNavigator {
        if (this._isSentinel || !this.list || index < 0) {
            return ActionDescriptorNavigator.createSentinel();
        }

        try {
            if (index < this.getCount()) {
                const desc = this.list.getObjectValue(index);
                return new ActionDescriptorNavigator(desc, false);
            }
        } catch (e: any) {
            // Failed to get object
        }

        return ActionDescriptorNavigator.createSentinel();
    }

    getFirstWhere(predicate: PredicateFunction): IActionDescriptorNavigator {
        const count = this.getCount();

        for (let i = 0; i < count; i++) {
            const item = this.getObject(i);
            if (!item.isSentinel) {
                try {
                    if (predicate(item)) {
                        return item;
                    }
                } catch (e: any) {
                    // Continue searching
                }
            }
        }

        // FIXED: Return sentinel, never null
        return ActionDescriptorNavigator.createSentinel();
    }

    getSingleWhere(predicate: PredicateFunction): IActionDescriptorNavigator {
        const matches = this.getAllWhere(predicate);

        if (matches.length === 1) {
            return matches[0];
        }

        // Return sentinel for no matches or multiple matches
        return ActionDescriptorNavigator.createSentinel();
    }

    getAllWhere(predicate: PredicateFunction): IActionDescriptorNavigator[] {
        const results: IActionDescriptorNavigator[] = [];
        const count = this.getCount();

        for (let i = 0; i < count; i++) {
            const item = this.getObject(i);
            if (!item.isSentinel) {
                try {
                    if (predicate(item)) {
                        results.push(item);
                    }
                } catch (e: any) {
                    // Continue searching
                }
            }
        }

        return results;
    }

    whereMatches(predicate: PredicateFunction): IEnumerable {
        const matches = this.getAllWhere(predicate);
        return new SimpleEnumerable(matches);
    }

    select<T>(transformer: SelectorFunction<T>): IEnumerableArray<T> {
        const items: IActionDescriptorNavigator[] = [];
        const count = this.getCount();

        for (let i = 0; i < count; i++) {
            const item = this.getObject(i);
            if (!item.isSentinel) {
                items.push(item);
            }
        }

        return new SimpleEnumerable(items).select(transformer);
    }

    // ✅ ADD THIS NEW METHOD IMPLEMENTATION:
    /**
     * Combines selection and filtering in a single operation for improved performance.
     * This method is more efficient than chaining .select().whereMatches() because it
     * applies the predicate immediately after each transformation, avoiding intermediate
     * array creation for items that won't pass the filter.
     * 
     * @template T The type of objects created by the selector function
     * @param selector Function that extracts/transforms properties from each ActionDescriptorNavigator
     * @param predicate Function that tests each transformed object against filter criteria
     * @returns IEnumerableArray<T> containing only matching transformed objects
     * 
     * @example
     * ```typescript
     * // Efficient text style filtering
     * const expectedFont = "Arial";
     * const expectedSize = 24;
     * 
     * const perfectMatches = textLayer.getObject('textKey')
     *     .getList('textStyleRange')
     *     .selectWhere(
     *         range => {
     *             const textStyle = range.getObject('textStyle');
     *             return {
     *                 fontName: textStyle.getString('fontName'),
     *                 fontSize: textStyle.getUnitDouble('impliedFontSize'),
     *                 range: `${range.getInteger('from')}-${range.getInteger('to')}`
     *             };
     *         },
     *         style => {
     *             const validFont = style.fontName === expectedFont;
     *             const validSize = Math.abs(style.fontSize - expectedSize) < 0.1;
     *             const notSentinel = style.fontName !== SENTINELS.string;
     *             return validFont && validSize && notSentinel;
     *         }
     *     );
     * 
     * const results = perfectMatches.toResultArray();
     * console.log(`Found ${results.length} perfect text style matches`);
     * ```
     */
    selectWhere<T>(selector: SelectorFunction<T>, predicate: TransformedPredicateFunction<T>): IEnumerableArray<T> {
        const matchingItems: T[] = [];
        const count = this.getCount();

        // Early return for sentinel lists
        if (this._isSentinel || !this.list) {
            return new SimpleEnumerableArray<T>(matchingItems);
        }

        for (let i = 0; i < count; i++) {
            const item = this.getObject(i);

            // Skip sentinel items
            if (!item.isSentinel) {
                try {
                    // Apply selector to transform the item
                    const transformedItem = selector(item, i);

                    // Only proceed if transformation was successful
                    if (transformedItem !== null && transformedItem !== undefined) {
                        try {
                            // Apply predicate to test the transformed item
                            if (predicate(transformedItem)) {
                                matchingItems.push(transformedItem);
                            }
                        } catch (predicateError: any) {
                            // Predicate failed - skip this item
                            // This is expected behavior for items that don't match criteria
                        }
                    }
                } catch (selectorError: any) {
                    // Selector failed - skip this item
                    // This maintains the sentinel pattern of safe chaining
                }
            }
        }

        return new SimpleEnumerableArray<T>(matchingItems);
    }

    asEnumerable(): IEnumerable {
        const items: IActionDescriptorNavigator[] = [];
        const count = this.getCount();

        for (let i = 0; i < count; i++) {
            const item = this.getObject(i);
            if (!item.isSentinel) {
                items.push(item);
            }
        }

        return new SimpleEnumerable(items);
    }

    debug(label: string): IActionListNavigator {
        console.log(`[${label}] ActionListNavigator: ${this._isSentinel ? 'SENTINEL' : this.getCount() + ' items'}`);
        return this;
    }

    static createSentinel(): ActionListNavigator {
        return new ActionListNavigator(null, true);
    }
}

// ===================================================================
// ENHANCED MAIN NAVIGATOR IMPLEMENTATION
// ===================================================================

/**
 * Enhanced ActionDescriptor navigator implementation
 * ENHANCED: Full type safety, consistent sentinel behavior, optimized performance
 */
export class ActionDescriptorNavigator implements IActionDescriptorNavigator {
    private descriptor: ActionDescriptor | null;
    private _isSentinel: boolean;

    constructor(descriptor: ActionDescriptor | null, isSentinel: boolean = false) {
        this.descriptor = descriptor;
        this._isSentinel = isSentinel || !descriptor;
    }

    get isSentinel(): boolean {
        return this._isSentinel;
    }

    // ===================================================================
    // NAVIGATION METHODS
    // ===================================================================

    getObject(key: string): IActionDescriptorNavigator {
        if (this._isSentinel || !this.descriptor || !key || key.length === 0) {
            return ActionDescriptorNavigator.createSentinel();
        }

        try {
            const keyID = stringIDToTypeID(key);
            if (this.descriptor.hasKey(keyID)) {
                const desc = this.descriptor.getObjectValue(keyID);
                return new ActionDescriptorNavigator(desc, false);
            }
        } catch (e: any) {
            // Failed to get object
        }

        return ActionDescriptorNavigator.createSentinel();
    }

    getList(key: string): IActionListNavigator {
        if (this._isSentinel || !this.descriptor || !key || key.length === 0) {
            return ActionListNavigator.createSentinel();
        }

        try {
            const keyID = stringIDToTypeID(key);
            if (this.descriptor.hasKey(keyID)) {
                const list = this.descriptor.getList(keyID);
                return new ActionListNavigator(list, false);
            }
        } catch (e: any) {
            // Failed to get list
        }

        return ActionListNavigator.createSentinel();
    }

    // ===================================================================
    // VALUE EXTRACTION METHODS - ENHANCED ERROR HANDLING
    // ===================================================================

    getString(key: string): string {
        return this.getStringValue(key, 'getString');
    }

    getInteger(key: string): number {
        return this.getIntegerValue(key, 'getInteger');
    }

    getDouble(key: string): number {
        return this.getDoubleValue(key, 'getDouble');
    }

    getBoolean(key: string): boolean {
        if (this._isSentinel || !this.descriptor || !key || key.length === 0) {
            return SENTINELS.boolean;
        }

        try {
            const keyID = stringIDToTypeID(key);
            if (this.descriptor.hasKey(keyID)) {
                return this.descriptor.getBoolean(keyID);
            }
        } catch (e: any) {
            // Failed to get boolean
        }

        return SENTINELS.boolean;
    }

    getUnitDouble(key: string): number {
        return this.getDoubleValue(key, 'getUnitDoubleValue');
    }

    getEnumerationString(key: string): string {
        if (this._isSentinel || !this.descriptor || !key || key.length === 0) {
            return SENTINELS.string;
        }

        try {
            const keyID = stringIDToTypeID(key);
            if (this.descriptor.hasKey(keyID)) {
                const enumValue = this.descriptor.getEnumerationValue(keyID);
                const enumString = typeIDToStringID(enumValue);
                return enumString || SENTINELS.string;
            }
        } catch (e: any) {
            // Failed to get enumeration
        }

        return SENTINELS.string;
    }

    getEnumerationId(key: string): number {
        return this.getIntegerValue(key, 'getEnumerationValue');
    }

    // Advanced value methods for completeness
    getData(key: string): string { return this.getStringValue(key, 'getData'); }
    getClass(key: string): number { return this.getIntegerValue(key, 'getClass'); }
    getLargeInteger(key: string): number { return this.getIntegerValue(key, 'getLargeInteger'); }
    getObjectType(key: string): number { return this.getIntegerValue(key, 'getObjectType'); }
    getUnitDoubleType(key: string): number { return this.getIntegerValue(key, 'getUnitDoubleType'); }
    getUnitDoubleValue(key: string): number { return this.getDoubleValue(key, 'getUnitDoubleValue'); }
    getEnumerationType(key: string): number { return this.getIntegerValue(key, 'getEnumerationType'); }
    getType(key: string): number { return this.getIntegerValue(key, 'getType'); }

    // ===================================================================
    // FILE AND REFERENCE METHODS - EXCEPTION TO SENTINEL PATTERN
    // ===================================================================

    getPath(key: string): File | null {
        if (this._isSentinel || !this.descriptor || !key || key.length === 0) {
            return SENTINELS.file;
        }

        try {
            const keyID = stringIDToTypeID(key);
            if (this.descriptor.hasKey(keyID)) {
                return this.descriptor.getPath(keyID); // Returns File or null
            }
        } catch (e: any) {
            // Failed to get path
        }

        return SENTINELS.file; // null
    }

    getReference(key: string): ActionReference | null {
        if (this._isSentinel || !this.descriptor || !key || key.length === 0) {
            return SENTINELS.reference;
        }

        try {
            const keyID = stringIDToTypeID(key);
            if (this.descriptor.hasKey(keyID)) {
                return this.descriptor.getReference(keyID); // Returns ActionReference or null
            }
        } catch (e: any) {
            // Failed to get reference
        }

        return SENTINELS.reference; // null
    }

    // ===================================================================
    // UTILITY METHODS
    // ===================================================================

    getBounds(): Bounds {
        if (this._isSentinel || !this.descriptor) {
            // FIXED: Return object literal that conforms to Bounds interface
            return { left: 0, top: 0, right: 0, bottom: 0 } as Bounds;
        }

        try {
            const boundsKey = stringIDToTypeID("bounds");
            if (this.descriptor.hasKey(boundsKey)) {
                const boundsDesc = this.descriptor.getObjectValue(boundsKey);
                const left = boundsDesc.getUnitDoubleValue(stringIDToTypeID("left"));
                const top = boundsDesc.getUnitDoubleValue(stringIDToTypeID("top"));
                const right = boundsDesc.getUnitDoubleValue(stringIDToTypeID("right"));
                const bottom = boundsDesc.getUnitDoubleValue(stringIDToTypeID("bottom"));

                // FIXED: Return object literal instead of new Bounds()
                return {
                    left: left,
                    top: top,
                    right: right,
                    bottom: bottom
                } as Bounds;
            }
        } catch (e: any) {
            // Fall through to sentinel
        }

        // Return sentinel bounds
        return { left: 0, top: 0, right: 0, bottom: 0 } as Bounds;
    }

    hasKey(key: string): boolean {
        if (this._isSentinel || !this.descriptor || !key || key.length === 0) {
            return false;
        }

        try {
            const keyID = stringIDToTypeID(key);
            return this.descriptor.hasKey(keyID);
        } catch (e: any) {
            return false;
        }
    }

    select<T>(selector: SelectorFunction<T>): T | null {
        if (this._isSentinel) {
            return null;
        }

        try {
            return selector(this, 0);
        } catch (e: any) {
            return null;
        }
    }

    debug(label: string): IActionDescriptorNavigator {
        console.log(`[${label}] ActionDescriptorNavigator: ${this._isSentinel ? 'SENTINEL' : 'OK'}`);
        return this;
    }

    // ===================================================================
    // HELPER METHODS - CONSISTENT ERROR HANDLING
    // ===================================================================

    private getStringValue(key: string, methodName: string): string {
        if (this._isSentinel || !this.descriptor || !key || key.length === 0) return SENTINELS.string;
        try {
            const keyID = stringIDToTypeID(key);
            return this.descriptor.hasKey(keyID) ? (this.descriptor as any)[methodName](keyID) : SENTINELS.string;
        } catch (e: any) { return SENTINELS.string; }
    }

    private getIntegerValue(key: string, methodName: string): number {
        if (this._isSentinel || !this.descriptor || !key || key.length === 0) return SENTINELS.integer;
        try {
            const keyID = stringIDToTypeID(key);
            return this.descriptor.hasKey(keyID) ? (this.descriptor as any)[methodName](keyID) : SENTINELS.integer;
        } catch (e: any) { return SENTINELS.integer; }
    }

    private getDoubleValue(key: string, methodName: string): number {
        if (this._isSentinel || !this.descriptor || !key || key.length === 0) return SENTINELS.double;
        try {
            const keyID = stringIDToTypeID(key);
            return this.descriptor.hasKey(keyID) ? (this.descriptor as any)[methodName](keyID) : SENTINELS.double;
        } catch (e: any) { return SENTINELS.double; }
    }

    // ===================================================================
    // STATIC FACTORY METHODS
    // ===================================================================

    /**
     * Get navigator for current document
     */
    static forCurrentDocument(): ActionDescriptorNavigator {
        try {
            const ref = new ActionReference();
            ref.putEnumerated(charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
            const desc = executeActionGet(ref);
            return new ActionDescriptorNavigator(desc, false);
        } catch (e: any) {
            return ActionDescriptorNavigator.createSentinel();
        }
    }

    /**
     * Get navigator for current layer
     */
    static forCurrentLayer(): ActionDescriptorNavigator {
        try {
            const ref = new ActionReference();
            ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
            const desc = executeActionGet(ref);
            return new ActionDescriptorNavigator(desc, false);
        } catch (e: any) {
            return ActionDescriptorNavigator.createSentinel();
        }
    }

    /**
     * Get navigator for layer by name
     */
    static forLayerByName(layerName: string): ActionDescriptorNavigator {
        if (!layerName || layerName.trim().length === 0) {
            return ActionDescriptorNavigator.createSentinel();
        }

        const searchName = layerName.toLowerCase().trim();
        const layerCount = ActionDescriptorNavigator.getLayerCount();

        // Search through all layers
        for (let i = 1; i <= layerCount; i++) {
            const layer = ActionDescriptorNavigator.forLayerByIndex(i);
            const currentName = layer.getString('name');

            if (currentName !== SENTINELS.string &&
                currentName.toLowerCase().trim() === searchName) {
                return layer;
            }
        }

        return ActionDescriptorNavigator.createSentinel();
    }

    /**
     * Get navigator for a layer by index (1-based)
     */
    private static forLayerByIndex(index: number): ActionDescriptorNavigator {
        if (index < 1) {
            return ActionDescriptorNavigator.createSentinel();
        }

        try {
            const ref = new ActionReference();
            ref.putIndex(charIDToTypeID("Lyr "), index);
            const desc = executeActionGet(ref);
            return new ActionDescriptorNavigator(desc, false);
        } catch (e: any) {
            return ActionDescriptorNavigator.createSentinel();
        }
    }

    /**
     * Get total layer count - FIXED: Consistent API usage
     */
    private static getLayerCount(): number {
        try {
            const ref = new ActionReference();
            ref.putProperty(charIDToTypeID("Prpr"), charIDToTypeID("NmbL"));
            ref.putEnumerated(charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
            const desc = executeActionGet(ref);
            return desc.getInteger(charIDToTypeID("NmbL"));
        } catch (e: any) {
            return 0; // CORRECT: 0 layers is valid state, -1 would indicate failed operation
        }
    }

    /**
     * Create a sentinel navigator
     */
    static createSentinel(): ActionDescriptorNavigator {
        return new ActionDescriptorNavigator(null, true);
    }
}