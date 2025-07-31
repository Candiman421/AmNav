//ps/action-manager/ActionDescriptorNavigator.ts
/**
 * ActionDescriptor Navigator - Consolidated Enhanced Implementation
 * 
 * Clean, composable API for navigating Photoshop's ActionManager with sentinel-based error handling.
 * No complex caching - users cache naturally with const variables.
 * Never crashes - always returns safe sentinel values on errors.
 * 
 * CONSOLIDATED: Merges best features from both implementations
 * ENHANCED: Superior enumerable system with LINQ-style operations
 * FIXED: getBounds() returns Bounds instead of Rectangle
 * FIXED: SelectorFunction now supports index parameter
 * 
 * @fileoverview Enhanced ActionManager navigation implementation
 * @version 2.1.1
 * 
 * @example Best - Natural caching with const variables
 * ```typescript
 * import { ActionDescriptorNavigator } from './action-manager/ActionDescriptorNavigator';
 * 
 * // 1. Travel down hierarchy to focus scope - target specific layers
 * const titleLayer = ActionDescriptorNavigator.forLayerByName('Title');
 * const textObj = titleLayer.getObject('textKey');
 * 
 * // 2. Chain to get ranges with enhanced LINQ operations
 * const styleRanges = textObj.getList('textStyleRange');
 * 
 * // 3. Use sophisticated filtering and transformations with index support
 * const filteredRanges = styleRanges
 *   .whereMatches(range => range.getInteger('from') === 0)
 *   .select((range, index) => ({
 *     from: range.getInteger('from'),
 *     to: range.getInteger('to'),
 *     index: index,
 *     style: range.getObject('textStyle')
 *   }));
 * 
 * // 4. Store navigators in const variables (natural caching!)
 * const firstRange = styleRanges.getFirstWhere(range => range.getInteger('from') === 0);
 * const textStyle = firstRange.getObject('textStyle');
 * const color = textStyle.getObject('color');
 * 
 * // 5. Process quickly from cached variables (no repeated API calls)
 * const red = color.getDouble('red');      // Fast access
 * const green = color.getDouble('green');  // Using cached navigator
 * const blue = color.getDouble('blue');    // No if checks needed
 * const fontSize = textStyle.getUnitDouble('sizeKey');
 * const fontName = textStyle.getString('fontPostScriptName');
 * 
 * // Never crashes - always safe values (sentinels on error)
 * ```
 */

// Import core functions from framework
import {
    executeActionGet,
    stringIDToTypeID,
    charIDToTypeID,
    typeIDToStringID
} from '../ps';

// Import simplified types and constants
import {
    SENTINELS,
    IActionDescriptorNavigator,
    IActionListNavigator,
    IEnumerable,
    IEnumerableArray,
    PredicateFunction,
    SelectorFunction
} from './adn-types';

// NOTE: Bounds, ActionDescriptor, ActionReference, ActionList, File are all global Adobe classes

// ===================================================================
// ENHANCED ENUMERABLE SUPPORT CLASSES  
// ===================================================================

/**
 * Enhanced enumerable for sophisticated filtering and transformations
 * Superior implementation from ps-nav.ts with advanced error handling
 * FIXED: select() now passes index parameter
 */
class SimpleEnumerable implements IEnumerable {
    private items: IActionDescriptorNavigator[];

    constructor(items: IActionDescriptorNavigator[]) {
        this.items = items || [];
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
        return this.items.length > 0 ? this.items[0] : ActionDescriptorNavigator.createSentinel();
    }

    hasAnyMatches(): boolean {
        return this.items.length > 0;
    }

    getCount(): number {
        return this.items.length;
    }

    select<T>(transformer: SelectorFunction<T>): IEnumerableArray {
        const transformed = this.items.map((item, index) => {
            if (item.isSentinel) return null;
            try {
                // FIXED: Now passes index parameter
                return transformer(item, index);
            } catch (e: any) {
                return null;
            }
        }).filter(item => item !== null);

        return new SimpleEnumerableArray(transformed);
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
 * Superior implementation with comprehensive method chaining
 * FIXED: select() now passes index parameter
 */
class SimpleEnumerableArray implements IEnumerableArray {
    readonly array: any[];

    constructor(items: any[]) {
        this.array = items || [];
    }

    whereMatches(predicate: (item: any) => boolean): IEnumerableArray {
        const filtered = this.array.filter(item => {
            try {
                return predicate(item);
            } catch (e: any) {
                return false;
            }
        });
        return new SimpleEnumerableArray(filtered);
    }

    getFirst(): any {
        return this.array.length > 0 ? this.array[0] : null;
    }

    getCount(): number {
        return this.array.length;
    }

    hasAnyMatches(): boolean {
        return this.array.length > 0;
    }

    select<T>(transformer: (item: any, index?: number) => T): IEnumerableArray {
        const transformed = this.array.map((item, index) => {
            try {
                // FIXED: Now passes index parameter
                return transformer(item, index);
            } catch (e: any) {
                return null;
            }
        }).filter(item => item !== null);

        return new SimpleEnumerableArray(transformed);
    }

    toResultArray(): any[] {
        return [...this.array];
    }

    debug(label: string): IEnumerableArray {
        console.log(`[${label}] EnumerableArray with ${this.array.length} items`);
        return this;
    }
}

// ===================================================================
// ENHANCED LIST NAVIGATOR IMPLEMENTATION
// ===================================================================

/**
 * Enhanced ActionList navigator with superior enumerable support
 * Merged implementation with comprehensive collection operations
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
            return 0;
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
            const count = this.list.count || 0;
            if (index >= count) {
                return ActionDescriptorNavigator.createSentinel();
            }

            const desc = this.list.getObjectValue(index);
            return new ActionDescriptorNavigator(desc, false);
        } catch (e: any) {
            return ActionDescriptorNavigator.createSentinel();
        }
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
        return ActionDescriptorNavigator.createSentinel();
    }

    getSingleWhere(predicate: PredicateFunction): IActionDescriptorNavigator {
        return this.getFirstWhere(predicate);
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

    select<T>(transformer: SelectorFunction<T>): IEnumerableArray {
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
 * Consolidated best features with superior error handling and debugging
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
    // VALUE EXTRACTION METHODS
    // ===================================================================

    getString(key: string): string {
        if (this._isSentinel || !this.descriptor || !key || key.length === 0) {
            return SENTINELS.string;
        }

        try {
            const keyID = stringIDToTypeID(key);
            if (this.descriptor.hasKey(keyID)) {
                return this.descriptor.getString(keyID);
            }
        } catch (e: any) {
            // Failed to get string
        }

        return SENTINELS.string;
    }

    getDouble(key: string): number {
        if (this._isSentinel || !this.descriptor || !key || key.length === 0) {
            return SENTINELS.double;
        }

        try {
            const keyID = stringIDToTypeID(key);
            if (this.descriptor.hasKey(keyID)) {
                return this.descriptor.getDouble(keyID);
            }
        } catch (e: any) {
            // Failed to get double
        }

        return SENTINELS.double;
    }

    getInteger(key: string): number {
        if (this._isSentinel || !this.descriptor || !key || key.length === 0) {
            return SENTINELS.integer;
        }

        try {
            const keyID = stringIDToTypeID(key);
            if (this.descriptor.hasKey(keyID)) {
                return this.descriptor.getInteger(keyID);
            }
        } catch (e: any) {
            // Failed to get integer
        }

        return SENTINELS.integer;
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
        if (this._isSentinel || !this.descriptor || !key || key.length === 0) {
            return SENTINELS.double;
        }

        try {
            const keyID = stringIDToTypeID(key);
            if (this.descriptor.hasKey(keyID)) {
                return this.descriptor.getUnitDoubleValue(keyID);
            }
        } catch (e: any) {
            // Failed to get unit double
        }

        return SENTINELS.double;
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
        if (this._isSentinel || !this.descriptor || !key || key.length === 0) {
            return SENTINELS.integer;
        }

        try {
            const keyID = stringIDToTypeID(key);
            if (this.descriptor.hasKey(keyID)) {
                return this.descriptor.getEnumerationValue(keyID);
            }
        } catch (e: any) {
            // Failed to get enumeration
        }

        return SENTINELS.integer;
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

    // File and reference methods - Exception to sentinel pattern (return null)
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

    // Helper methods to reduce duplication
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
    // UTILITY METHODS
    // ===================================================================

    getBounds(): Bounds {
        // FIXED: Returns Bounds instead of Rectangle
        try {
            if (!this._isSentinel && this.descriptor) {
                const boundsKey = stringIDToTypeID("bounds");
                if (this.descriptor.hasKey(boundsKey)) {
                    const boundsDesc = this.descriptor.getObjectValue(boundsKey);
                    const left = boundsDesc.getUnitDoubleValue(stringIDToTypeID("left"));
                    const top = boundsDesc.getUnitDoubleValue(stringIDToTypeID("top"));
                    const right = boundsDesc.getUnitDoubleValue(stringIDToTypeID("right"));
                    const bottom = boundsDesc.getUnitDoubleValue(stringIDToTypeID("bottom"));
                    
                    // Create Bounds object (extends Array<number>)
                    const bounds = new Bounds();
                    bounds.left = left;
                    bounds.top = top;
                    bounds.right = right;
                    bounds.bottom = bottom;
                    bounds.width = right - left;
                    bounds.height = bottom - top;
                    return bounds;
                }
            }
        } catch (e: any) {
            // Fall through to sentinel
        }

        // Return sentinel Bounds
        const sentinelBounds = new Bounds();
        sentinelBounds.left = 0;
        sentinelBounds.top = 0;
        sentinelBounds.right = 0;
        sentinelBounds.bottom = 0;
        sentinelBounds.width = 0;
        sentinelBounds.height = 0;
        return sentinelBounds;
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
            // Individual navigator select doesn't have an index context
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
    // STATIC FACTORY METHODS (Preserved from ActionDescriptorNavigator.ts)
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
     * Create a sentinel navigator (represents failed operation)
     */
    static createSentinel(): ActionDescriptorNavigator {
        return new ActionDescriptorNavigator(null, true);
    }

    /**
     * Get total number of layers in the current document
     */
    private static getLayerCount(): number {
        try {
            const ref = new ActionReference();
            ref.putProperty(stringIDToTypeID("property"), stringIDToTypeID("numberOfLayers"));
            ref.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
            const count = executeActionGet(ref).getInteger(stringIDToTypeID("numberOfLayers"));
            return (count > 0) ? count : 0;
        } catch (e: any) {
            return 0;
        }
    }
}