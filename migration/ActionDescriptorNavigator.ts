//ps/ActionDescriptorNavigator.ts
/**
 * Adobe ExtendScript ActionManager Navigator - Updated Implementation
 * 
 * Clean, composable API for navigating Photoshop's ActionManager with sentinel-based error handling.
 * Never crashes - always returns safe sentinel values on errors.
 * Updated for new architectural patterns and import structure.
 * 
 * ARCHITECTURE ALIGNED: Uses core functions from ps.ts and types from adn-types.ts
 * ENHANCED: Supports parallel systems approach (ActionManager + DOM)
 * 
 * @fileoverview Fluent ActionManager navigation with sentinel error handling
 * @version 2.0.0
 * @author ActionManager Navigator Team
 * @license MIT
 * 
 * @example Best - Natural caching with const variables
 * ```typescript
 * import { ActionDescriptorNavigator } from './ActionDescriptorNavigator';
 * 
 * // Travel down hierarchy and cache key navigators
 * const titleLayer = ActionDescriptorNavigator.forLayerByName('Title');
 * const textObj = titleLayer.getObject('textKey');
 * const styleRanges = textObj.getList('textStyleRange');
 * 
 * // Get specific ranges and cache them
 * const firstRange = styleRanges.getFirstWhere(range => range.getInteger('from') === 0);
 * const textStyle = firstRange.getObject('textStyle');
 * 
 * // Fast access from cached navigators
 * const analysis = {
 *   fontName: textStyle.getString('fontPostScriptName'),
 *   fontSize: textStyle.getUnitDouble('sizeKey'),
 *   bold: textStyle.getBoolean('syntheticBold')
 * };
 * ```
 * 
 * @example Good - Multi-layer analysis workflow
 * ```typescript
 * import { ActionDescriptorNavigator } from './ActionDescriptorNavigator';
 * 
 * const layers = ['Header', 'Body Text', 'Footer'];
 * const analysis = layers.map(name => {
 *   const layer = ActionDescriptorNavigator.forLayerByName(name);
 *   const textStyle = layer.getObject('textKey')
 *     .getList('textStyleRange')
 *     .getFirstWhere(range => range.getInteger('from') === 0)
 *     .getObject('textStyle');
 *   
 *   return {
 *     name,
 *     font: textStyle.getString('fontPostScriptName'),
 *     size: textStyle.getUnitDouble('sizeKey'),
 *     bounds: layer.getBounds()
 *   };
 * });
 * ```
 */

// Core functions from ps.ts
import {
    executeActionGet,
    stringIDToTypeID,
    charIDToTypeID,
    typeIDToStringID
} from './ps';

// Types and constants from adn-types.ts
import {
    SENTINELS,
    PredicateFunction,
    SelectorFunction,
    IActionDescriptorNavigator,
    IActionListNavigator,
    IEnumerable,
    IEnumerableArray
} from './adn-types';

// NOTE: ActionDescriptor, ActionReference, ActionList are global classes from index.d.ts
// NOTE: Rectangle is global class from index.d.ts

// ===================================================================
// ENUMERABLE SUPPORT CLASSES
// ===================================================================

/**
 * Simple enumerable implementation for LINQ-style operations
 */
class SimpleEnumerable implements IEnumerable {
    private items: IActionDescriptorNavigator[];

    constructor(items: IActionDescriptorNavigator[]) {
        this.items = items;
    }

    /**
     * Filter items by criteria and return new enumerable for continued chaining
     */
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

    /**
     * Get first item from filtered results
     */
    getFirst(): IActionDescriptorNavigator {
        return this.items.length > 0 ? this.items[0] : ActionDescriptorNavigator.createSentinel();
    }

    /**
     * Check if any items exist after filtering
     */
    hasAnyMatches(): boolean {
        return this.items.length > 0;
    }

    /**
     * Count items after filtering
     */
    getCount(): number {
        return this.items.length;
    }

    /**
     * Transform items and return enumerable array for continued processing
     */
    select<T>(transformer: SelectorFunction<T>): IEnumerableArray {
        const transformed = this.items.map(item => {
            if (item.isSentinel) return null;
            try {
                return transformer(item);
            } catch (e: any) {
                return null;
            }
        }).filter(item => item !== null);

        return new SimpleEnumerableArray(transformed);
    }

    /**
     * Get all filtered items as array (terminal operation)
     */
    toResultArray(): IActionDescriptorNavigator[] {
        return this.items.slice();
    }

    /**
     * Add debug information without breaking the chain
     */
    debug(label: string): IEnumerable {
        try {
            if (typeof $ !== 'undefined' && $ && $.writeln) {
                $.writeln(label + ': ' + this.items.length + ' items');
            }
        } catch (e: any) {
            // Graceful fallback
        }
        return this;
    }
}

/**
 * Simple enumerable array for transformed items
 */
class SimpleEnumerableArray implements IEnumerableArray {
    public readonly array: any[];

    constructor(items: any[]) {
        this.array = items;
    }

    /**
     * Continue filtering after transformation
     */
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

    /**
     * Continue transforming items
     */
    select<T>(transformer: (item: any) => T): IEnumerableArray {
        const transformed = this.array.map(item => {
            try {
                return transformer(item);
            } catch (e: any) {
                return null;
            }
        }).filter(item => item !== null);

        return new SimpleEnumerableArray(transformed);
    }

    /**
     * Get all transformed items as plain array (terminal operation)
     */
    toResultArray(): any[] {
        return this.array.slice();
    }

    debug(label: string): IEnumerableArray {
        try {
            if (typeof $ !== 'undefined' && $ && $.writeln) {
                $.writeln(label + ': ' + this.array.length + ' items');
            }
        } catch (e: any) {
            // Graceful fallback
        }
        return this;
    }
}

// ===================================================================
// ACTIONDESCRIPTORNAVIGATOR CLASS
// ===================================================================

/**
 * Primary navigator for ActionDescriptor objects.
 * Simple, chainable API with sentinel-based error handling.
 * No complex caching - users cache naturally with const variables.
 */
export class ActionDescriptorNavigator implements IActionDescriptorNavigator {
    public readonly isSentinel: boolean;
    private desc: ActionDescriptor | null;

    /**
     * Create ActionDescriptor navigator
     */
    constructor(desc: ActionDescriptor | null) {
        this.desc = desc;
        this.isSentinel = desc === null || desc === undefined;
    }

    // ===================================================================
    // STATIC FACTORY METHODS
    // ===================================================================

    /**
     * Get navigator for the currently selected layer
     */
    static forCurrentLayer(): ActionDescriptorNavigator {
        try {
            const ref = new ActionReference();
            ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
            const desc = executeActionGet(ref);
            return new ActionDescriptorNavigator(desc);
        } catch (e: any) {
            return ActionDescriptorNavigator.createSentinel();
        }
    }

    /**
     * Get navigator for the current document
     */
    static forCurrentDocument(): ActionDescriptorNavigator {
        try {
            const ref = new ActionReference();
            ref.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
            const desc = executeActionGet(ref);
            return new ActionDescriptorNavigator(desc);
        } catch (e: any) {
            return ActionDescriptorNavigator.createSentinel();
        }
    }

    /**
     * Get navigator for a layer by name (case-insensitive)
     */
    static forLayerByName(layerName: string): ActionDescriptorNavigator {
        if (!layerName || layerName.length === 0) {
            return ActionDescriptorNavigator.createSentinel();
        }

        const searchName = layerName.toLowerCase().replace(/^\s+|\s+$/g, '');
        const layerCount = ActionDescriptorNavigator.getLayerCount();

        if (layerCount <= 0) {
            return ActionDescriptorNavigator.createSentinel();
        }

        for (let i = 1; i <= layerCount; i++) {
            const layer = ActionDescriptorNavigator.forLayerByIndex(i);
            const currentName = layer.getString('name');

            if (currentName !== SENTINELS.string &&
                currentName.toLowerCase().replace(/^\s+|\s+$/g, '') === searchName) {
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
            return new ActionDescriptorNavigator(desc);
        } catch (e: any) {
            return ActionDescriptorNavigator.createSentinel();
        }
    }

    /**
     * Create a sentinel navigator (represents failed operation)
     */
    static createSentinel(): ActionDescriptorNavigator {
        return new ActionDescriptorNavigator(null);
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
            return (count > 0) ? count : -1;
        } catch (e: any) {
            return -1;
        }
    }

    // ===================================================================
    // NAVIGATION METHODS
    // ===================================================================

    /**
     * Navigate to a child object within this descriptor
     */
    getObject(key: string): IActionDescriptorNavigator {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return ActionDescriptorNavigator.createSentinel();
        }

        try {
            const typeID = stringIDToTypeID(key);
            if (!this.desc.hasKey(typeID)) {
                return ActionDescriptorNavigator.createSentinel();
            }
            const nestedDesc = this.desc.getObjectValue(typeID);
            return new ActionDescriptorNavigator(nestedDesc);
        } catch (e: any) {
            return ActionDescriptorNavigator.createSentinel();
        }
    }

    /**
     * Navigate to a list collection within this descriptor
     */
    getList(key: string): IActionListNavigator {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return ActionListNavigator.createSentinel();
        }

        try {
            const typeID = stringIDToTypeID(key);
            if (!this.desc.hasKey(typeID)) {
                return ActionListNavigator.createSentinel();
            }
            const list = this.desc.getList(typeID);
            return new ActionListNavigator(list);
        } catch (e: any) {
            return ActionListNavigator.createSentinel();
        }
    }

    // ===================================================================
    // VALUE EXTRACTION METHODS
    // ===================================================================

    /**
     * Extract string value from this descriptor
     */
    getString(key: string): string {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.string;
        }

        try {
            const typeID = stringIDToTypeID(key);
            if (!this.desc.hasKey(typeID)) {
                return SENTINELS.string;
            }
            return this.desc.getString(typeID);
        } catch (e: any) {
            return SENTINELS.string;
        }
    }

    /**
     * Extract double/number value from this descriptor
     */
    getDouble(key: string): number {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.double;
        }

        try {
            const typeID = stringIDToTypeID(key);
            if (!this.desc.hasKey(typeID)) {
                return SENTINELS.double;
            }
            return this.desc.getDouble(typeID);
        } catch (e: any) {
            return SENTINELS.double;
        }
    }

    /**
     * Extract unit double value (measurements with units)
     */
    getUnitDouble(key: string): number {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.double;
        }

        try {
            const typeID = stringIDToTypeID(key);
            if (!this.desc.hasKey(typeID)) {
                return SENTINELS.double;
            }
            return this.desc.getUnitDoubleValue(typeID);
        } catch (e: any) {
            return SENTINELS.double;
        }
    }

    /**
     * Extract integer value from this descriptor
     */
    getInteger(key: string): number {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.integer;
        }

        try {
            const typeID = stringIDToTypeID(key);
            if (!this.desc.hasKey(typeID)) {
                return SENTINELS.integer;
            }
            return this.desc.getInteger(typeID);
        } catch (e: any) {
            return SENTINELS.integer;
        }
    }

    /**
     * Extract boolean value from this descriptor
     */
    getBoolean(key: string): boolean {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.boolean;
        }

        try {
            const typeID = stringIDToTypeID(key);
            if (!this.desc.hasKey(typeID)) {
                return SENTINELS.boolean;
            }
            return this.desc.getBoolean(typeID);
        } catch (e: any) {
            return SENTINELS.boolean;
        }
    }

    /**
     * Extract enumeration value as string from this descriptor
     */
    getEnumerationString(key: string): string {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.string;
        }

        try {
            const typeID = stringIDToTypeID(key);
            if (!this.desc.hasKey(typeID)) {
                return SENTINELS.string;
            }
            const enumValue = this.desc.getEnumerationValue(typeID);
            const enumString = typeIDToStringID(enumValue);
            return enumString || SENTINELS.string;
        } catch (e: any) {
            return SENTINELS.string;
        }
    }

    /**
     * Extract enumeration value as numeric ID
     */
    getEnumerationId(key: string): number {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.integer;
        }

        try {
            const typeID = stringIDToTypeID(key);
            if (!this.desc.hasKey(typeID)) {
                return SENTINELS.integer;
            }
            return this.desc.getEnumerationValue(typeID);
        } catch (e: any) {
            return SENTINELS.integer;
        }
    }

    /**
     * Extract file path reference
     */
    getPath(key: string): File {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.file;
        }

        try {
            const typeID = stringIDToTypeID(key);
            if (!this.desc.hasKey(typeID)) {
                return SENTINELS.file;
            }
            return this.desc.getPath(typeID) || SENTINELS.file;
        } catch (e: any) {
            return SENTINELS.file;
        }
    }

    /**
     * Extract ActionReference object
     */
    getReference(key: string): ActionReference {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return SENTINELS.reference;
        }

        try {
            const typeID = stringIDToTypeID(key);
            if (!this.desc.hasKey(typeID)) {
                return SENTINELS.reference;
            }
            return this.desc.getReference(typeID) || SENTINELS.reference;
        } catch (e: any) {
            return SENTINELS.reference;
        }
    }

    // Additional value methods for completeness
    getData(key: string): string { return this.getStringValue(key, 'getData'); }
    getClass(key: string): number { return this.getIntegerValue(key, 'getClass'); }
    getLargeInteger(key: string): number { return this.getIntegerValue(key, 'getLargeInteger'); }
    getObjectType(key: string): number { return this.getIntegerValue(key, 'getObjectType'); }
    getUnitDoubleType(key: string): number { return this.getIntegerValue(key, 'getUnitDoubleType'); }
    getUnitDoubleValue(key: string): number { return this.getDoubleValue(key, 'getUnitDoubleValue'); }
    getEnumerationType(key: string): number { return this.getIntegerValue(key, 'getEnumerationType'); }
    getType(key: string): number { return this.getIntegerValue(key, 'getType'); }

    // Helper methods to reduce duplication
    private getStringValue(key: string, methodName: string): string {
        if (this.isSentinel || !this.desc || !key || key.length === 0) return SENTINELS.string;
        try {
            const typeID = stringIDToTypeID(key);
            return this.desc.hasKey(typeID) ? (this.desc as any)[methodName](typeID) : SENTINELS.string;
        } catch (e: any) { return SENTINELS.string; }
    }

    private getIntegerValue(key: string, methodName: string): number {
        if (this.isSentinel || !this.desc || !key || key.length === 0) return SENTINELS.integer;
        try {
            const typeID = stringIDToTypeID(key);
            return this.desc.hasKey(typeID) ? (this.desc as any)[methodName](typeID) : SENTINELS.integer;
        } catch (e: any) { return SENTINELS.integer; }
    }

    private getDoubleValue(key: string, methodName: string): number {
        if (this.isSentinel || !this.desc || !key || key.length === 0) return SENTINELS.double;
        try {
            const typeID = stringIDToTypeID(key);
            return this.desc.hasKey(typeID) ? (this.desc as any)[methodName](typeID) : SENTINELS.double;
        } catch (e: any) { return SENTINELS.double; }
    }

    // ===================================================================
    // UTILITY METHODS
    // ===================================================================

    /**
     * Check if a key exists in the descriptor
     */
    hasKey(key: string): boolean {
        if (this.isSentinel || !this.desc || !key || key.length === 0) {
            return false;
        }

        try {
            const typeID = stringIDToTypeID(key);
            return this.desc.hasKey(typeID);
        } catch (e: any) {
            return false;
        }
    }

    /**
     * Get bounds information for the current object (typically a layer)
     */
    getBounds(): Rectangle {
        if (this.isSentinel || !this.desc) {
            // Create sentinel Rectangle with all sentinel values
            const sentinelRect = new Rectangle();
            sentinelRect.left = SENTINELS.double;
            sentinelRect.top = SENTINELS.double;
            sentinelRect.right = SENTINELS.double;
            sentinelRect.bottom = SENTINELS.double;
            sentinelRect.width = SENTINELS.double;
            sentinelRect.height = SENTINELS.double;
            return sentinelRect;
        }

        try {
            const boundsTypeID = stringIDToTypeID('bounds');
            if (!this.desc.hasKey(boundsTypeID)) {
                return this.createSentinelRectangle();
            }

            const boundsDesc = this.desc.getObjectValue(boundsTypeID);
            const left = boundsDesc.getUnitDoubleValue(stringIDToTypeID('left'));
            const top = boundsDesc.getUnitDoubleValue(stringIDToTypeID('top'));
            const right = boundsDesc.getUnitDoubleValue(stringIDToTypeID('right'));
            const bottom = boundsDesc.getUnitDoubleValue(stringIDToTypeID('bottom'));

            // Create and populate Rectangle using Adobe's existing class
            const rect = new Rectangle();
            rect.left = left;
            rect.top = top;
            rect.right = right;
            rect.bottom = bottom;
            rect.width = right - left;
            rect.height = bottom - top;
            rect.x = left;
            rect.y = top;
            return rect;
        } catch (e: any) {
            return this.createSentinelRectangle();
        }
    }

    private createSentinelRectangle(): Rectangle {
        const sentinelRect = new Rectangle();
        sentinelRect.left = SENTINELS.double;
        sentinelRect.top = SENTINELS.double;
        sentinelRect.right = SENTINELS.double;
        sentinelRect.bottom = SENTINELS.double;
        sentinelRect.width = SENTINELS.double;
        sentinelRect.height = SENTINELS.double;
        return sentinelRect;
    }

    /**
     * Transform this descriptor using a custom selector function
     */
    select<T>(selector: SelectorFunction<T>): T | null {
        if (this.isSentinel) {
            return null;
        }

        try {
            return selector(this);
        } catch (e: any) {
            return null;
        }
    }

    /**
     * Add debug information without breaking the chain
     */
    debug(label: string): IActionDescriptorNavigator {
        try {
            if (typeof $ !== 'undefined' && $ && $.writeln) {
                $.writeln(label + ': ' + (this.isSentinel ? 'SENTINEL' : 'OK'));
            }
        } catch (e: any) {
            // Graceful fallback
        }
        return this;
    }
}

// ===================================================================
// ACTIONLISTNAVIGATOR CLASS
// ===================================================================

/**
 * Navigator for ActionList collections with simple, composable methods.
 */
export class ActionListNavigator implements IActionListNavigator {
    public readonly isSentinel: boolean;
    private list: ActionList | null;

    constructor(list: ActionList | null) {
        this.list = list;
        this.isSentinel = list === null || list === undefined;
    }

    static createSentinel(): ActionListNavigator {
        return new ActionListNavigator(null);
    }

    /**
     * Get the number of items in this list
     */
    getCount(): number {
        if (this.isSentinel || !this.list) {
            return -1;
        }

        try {
            return this.list.count;
        } catch (e: any) {
            return -1;
        }
    }

    /**
     * Get item at specific index
     */
    getObject(index: number): IActionDescriptorNavigator {
        if (this.isSentinel || !this.list || index < 0) {
            return ActionDescriptorNavigator.createSentinel();
        }

        const listCount = this.getCount();
        if (listCount <= 0 || index >= listCount) {
            return ActionDescriptorNavigator.createSentinel();
        }

        try {
            const obj = this.list.getObjectValue(index);
            return new ActionDescriptorNavigator(obj);
        } catch (e: any) {
            return ActionDescriptorNavigator.createSentinel();
        }
    }

    /**
     * Find first item matching criteria
     */
    getFirstWhere(predicate: PredicateFunction): IActionDescriptorNavigator {
        if (this.isSentinel) {
            return ActionDescriptorNavigator.createSentinel();
        }

        const count = this.getCount();
        if (count <= 0) {
            return ActionDescriptorNavigator.createSentinel();
        }

        for (let i = 0; i < count; i++) {
            const item = this.getObject(i);
            if (item.isSentinel) continue;

            try {
                if (predicate(item)) {
                    return item;
                }
            } catch (e: any) {
                continue;
            }
        }

        return ActionDescriptorNavigator.createSentinel();
    }

    /**
     * Find exactly one item matching criteria
     */
    getSingleWhere(predicate: PredicateFunction): IActionDescriptorNavigator {
        const matches = this.getAllWhere(predicate);
        if (matches.length === 0) {
            try {
                if (typeof $ !== 'undefined' && $ && $.writeln) {
                    $.writeln('WARNING: getSingleWhere() - No objects matched criteria');
                }
            } catch (e: any) {
                // Graceful fallback
            }
            return ActionDescriptorNavigator.createSentinel();
        }
        if (matches.length > 1) {
            try {
                if (typeof $ !== 'undefined' && $ && $.writeln) {
                    $.writeln('WARNING: getSingleWhere() - Multiple objects matched (' + matches.length + '), expected exactly one');
                }
            } catch (e: any) {
                // Graceful fallback
            }
            return ActionDescriptorNavigator.createSentinel();
        }
        return matches[0];
    }

    /**
     * Find ALL items matching criteria - returns array directly
     */
    getAllWhere(predicate: PredicateFunction): IActionDescriptorNavigator[] {
        if (this.isSentinel) {
            return [];
        }

        const results: IActionDescriptorNavigator[] = [];
        const count = this.getCount();

        if (count <= 0) {
            return results;
        }

        for (let i = 0; i < count; i++) {
            const item = this.getObject(i);
            if (item.isSentinel) continue;

            try {
                if (predicate(item)) {
                    results.push(item);
                }
            } catch (e: any) {
                continue;
            }
        }

        return results;
    }

    /**
     * Filter items by criteria (returns chainable collection)
     */
    whereMatches(predicate: PredicateFunction): IEnumerable {
        const items = this.getAllWhere(predicate);
        return new SimpleEnumerable(items);
    }

    /**
     * Transform items using selector function
     */
    select<T>(transformer: SelectorFunction<T>): IEnumerableArray {
        if (this.isSentinel) {
            return new SimpleEnumerableArray([]);
        }

        const results: T[] = [];
        const count = this.getCount();

        for (let i = 0; i < count; i++) {
            const item = this.getObject(i);
            if (item.isSentinel) continue;

            try {
                const transformed = transformer(item);
                if (transformed !== null && transformed !== undefined) {
                    results.push(transformed);
                }
            } catch (e: any) {
                continue;
            }
        }

        return new SimpleEnumerableArray(results);
    }

    /**
     * Convert to enumerable for complex operations
     */
    asEnumerable(): IEnumerable {
        const items = this.getAllWhere(() => true); // Get all items
        return new SimpleEnumerable(items);
    }

    /**
     * Add debug information without breaking the chain
     */
    debug(label: string): IActionListNavigator {
        try {
            const count = this.getCount();
            if (typeof $ !== 'undefined' && $ && $.writeln) {
                $.writeln(label + ': ' + (count === -1 ? 'SENTINEL' : count + ' items'));
            }
        } catch (e: any) {
            // Graceful fallback
        }
        return this;
    }
}

/**
 * @fileoverview ActionDescriptorNavigator - Updated Implementation
 * 
 * Exports the complete ActionDescriptorNavigator framework updated for the new architecture
 * with proper imports from ps.ts and adn-types.ts, supporting parallel systems approach.
 * 
 * @example Updated Usage
 * ```typescript
 * import { ActionDescriptorNavigator } from './ActionDescriptorNavigator';
 * import { getDOMLayerByName } from './ps';
 * 
 * // Parallel systems approach
 * const layerName = 'Title';
 * const navigator = ActionDescriptorNavigator.forLayerByName(layerName);  // ActionManager
 * const domLayer = getDOMLayerByName(layerName);                          // DOM
 * 
 * // Use ActionManager for complex text analysis
 * const textStyle = navigator
 *   .getObject('textKey')
 *   .getList('textStyleRange')
 *   .getFirstWhere(range => range.getInteger('from') === 0)
 *   .getObject('textStyle');
 * 
 * const fontName = textStyle.getString('fontPostScriptName');
 * const fontSize = textStyle.getUnitDouble('sizeKey');
 * 
 * // Use DOM for operations requiring DOM objects
 * const isVisible = domLayer ? domLayer.visible : false;
 * ```
 * 
 * @version 2.0.0
 * @author ActionManager Navigator Team
 * @license MIT
 */

// Default export for convenience
export default ActionDescriptorNavigator;