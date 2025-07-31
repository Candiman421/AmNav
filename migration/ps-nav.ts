//ps/ps-nav.ts
/**
 * ActionDescriptor Navigator - Fluent ActionManager API
 * 
 * Provides fluent, chainable interface for navigating Photoshop's ActionManager API
 * with automatic sentinel-based error handling and LINQ-style collection operations.
 * 
 * CORRECTED: Uses global Adobe classes and existing framework functions
 * ENHANCED: Complete implementation with proper sentinel propagation
 * 
 * @fileoverview ActionManager navigation system with fluent API
 * @version 1.0.0
 */

// Import core functions from existing framework
import {
    executeActionGet,
    stringIDToTypeID,
    charIDToTypeID,
    typeIDToStringID
} from './ps';

// Import types and constants
import {
    SENTINELS,
    IActionDescriptorNavigator,
    IActionListNavigator,
    IEnumerable,
    IEnumerableArray,
    PredicateFunction,
    SelectorFunction
} from './adn-types';

// NOTE: Rectangle is global class from index.d.ts

// NOTE: ActionDescriptor, ActionReference, ActionList are global classes from index.d.ts

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

    toResultArray(): IActionDescriptorNavigator[] {
        return this.items.slice();
    }

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
 * Fluent navigation class for ActionDescriptor objects
 * Provides chainable methods with automatic sentinel error handling
 */
export class ActionDescriptorNavigator implements IActionDescriptorNavigator {
    private descriptor: ActionDescriptor | null;
    private _isSentinel: boolean;

    constructor(descriptor: ActionDescriptor | null, isSentinel: boolean = false) {
        this.descriptor = descriptor;
        this._isSentinel = isSentinel || descriptor === null || descriptor === undefined;
    }

    // ===================================================================
    // STATIC FACTORY METHODS
    // ===================================================================

    /**
     * Creates navigator for layer by name (preferred method)
     * @param layerName Name of the layer to navigate
     * @returns ActionDescriptorNavigator for the specified layer
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

            if (currentName !== SENTINELS["string"] &&
                currentName.toLowerCase().replace(/^\s+|\s+$/g, '') === searchName) {
                return layer;
            }
        }

        return ActionDescriptorNavigator.createSentinel();
    }

    /**
     * Creates navigator for current/active layer
     * @returns ActionDescriptorNavigator for the active layer
     */
    static forCurrentLayer(): ActionDescriptorNavigator {
        try {
            const ref = new ActionReference();  // Global class from index.d.ts
            ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
            const desc = executeActionGet(ref);
            return new ActionDescriptorNavigator(desc, false);
        } catch (e: any) {
            return ActionDescriptorNavigator.createSentinel();
        }
    }

    /**
     * Creates navigator for current document
     * @returns ActionDescriptorNavigator for the active document
     */
    static forCurrentDocument(): ActionDescriptorNavigator {
        try {
            const ref = new ActionReference();  // Global class from index.d.ts
            ref.putEnumerated(charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
            const desc = executeActionGet(ref);
            return new ActionDescriptorNavigator(desc, false);
        } catch (e: any) {
            return ActionDescriptorNavigator.createSentinel();
        }
    }

    /**
     * Get navigator for a layer by index (1-based)
     */
    private static forLayerByIndex(index: number): ActionDescriptorNavigator {
        if (index < 1) {
            return ActionDescriptorNavigator.createSentinel();
        }

        try {
            const ref = new ActionReference();  // Global class from index.d.ts
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
            const ref = new ActionReference();  // Global class from index.d.ts
            ref.putProperty(stringIDToTypeID("property"), stringIDToTypeID("numberOfLayers"));
            ref.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
            const count = executeActionGet(ref).getInteger(stringIDToTypeID("numberOfLayers"));
            return (count > 0) ? count : -1;
        } catch (e: any) {
            return -1;
        }
    }

    // ===================================================================
    // SENTINEL CHECKING
    // ===================================================================

    /**
     * Returns true if this navigator represents a sentinel (failed operation)
     */
    get isSentinel(): boolean {
        return this._isSentinel;
    }

    // ===================================================================
    // NAVIGATION METHODS
    // ===================================================================

    /**
     * Navigates to an object property
     * @param key Property key to navigate to
     * @returns Navigator for the object property
     */
    getObject(key: string): IActionDescriptorNavigator {
        if (this._isSentinel || !this.descriptor || !key || key.length === 0) {
            return ActionDescriptorNavigator.createSentinel();
        }

        try {
            const keyID = stringIDToTypeID(key);
            if (this.descriptor.hasKey(keyID)) {
                const objectDesc = this.descriptor.getObjectValue(keyID);
                return new ActionDescriptorNavigator(objectDesc, false);
            }
        } catch (e: any) {
            // Failed to get object
        }

        return ActionDescriptorNavigator.createSentinel();
    }

    /**
     * Navigates to a list property
     * @param key Property key to navigate to
     * @returns Navigator for the list property
     */
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

    /**
     * Gets a string value
     */
    getString(key: string): string {
        if (this._isSentinel || !this.descriptor || !key || key.length === 0) {
            return SENTINELS["string"];
        }

        try {
            const keyID = stringIDToTypeID(key);
            if (this.descriptor.hasKey(keyID)) {
                return this.descriptor.getString(keyID);
            }
        } catch (e: any) {
            // Failed to get string
        }

        return SENTINELS["string"];
    }

    /**
     * Gets an integer value
     */
    getInteger(key: string): number {
        if (this._isSentinel || !this.descriptor || !key || key.length === 0) {
            return SENTINELS["integer"];
        }

        try {
            const keyID = stringIDToTypeID(key);
            if (this.descriptor.hasKey(keyID)) {
                return this.descriptor.getInteger(keyID);
            }
        } catch (e: any) {
            // Failed to get integer
        }

        return SENTINELS["integer"];
    }

    /**
     * Gets a double value
     */
    getDouble(key: string): number {
        if (this._isSentinel || !this.descriptor || !key || key.length === 0) {
            return SENTINELS["double"];
        }

        try {
            const keyID = stringIDToTypeID(key);
            if (this.descriptor.hasKey(keyID)) {
                return this.descriptor.getDouble(keyID);
            }
        } catch (e: any) {
            // Failed to get double
        }

        return SENTINELS["double"];
    }

    /**
     * Gets a boolean value
     */
    getBoolean(key: string): boolean {
        if (this._isSentinel || !this.descriptor || !key || key.length === 0) {
            return SENTINELS["boolean"];
        }

        try {
            const keyID = stringIDToTypeID(key);
            if (this.descriptor.hasKey(keyID)) {
                return this.descriptor.getBoolean(keyID);
            }
        } catch (e: any) {
            // Failed to get boolean
        }

        return SENTINELS["boolean"];
    }

    /**
     * Gets a unit double value (like pixel measurements)
     */
    getUnitDouble(key: string): number {
        if (this._isSentinel || !this.descriptor || !key || key.length === 0) {
            return SENTINELS["double"];
        }

        try {
            const keyID = stringIDToTypeID(key);
            if (this.descriptor.hasKey(keyID)) {
                return this.descriptor.getUnitDoubleValue(keyID);
            }
        } catch (e: any) {
            // Failed to get unit double
        }

        return SENTINELS["double"];
    }

    /**
     * Gets enumeration value as string
     */
    getEnumerationString(key: string): string {
        if (this._isSentinel || !this.descriptor || !key || key.length === 0) {
            return SENTINELS["string"];
        }

        try {
            const keyID = stringIDToTypeID(key);
            if (this.descriptor.hasKey(keyID)) {
                const enumValue = this.descriptor.getEnumerationValue(keyID);
                const enumString = typeIDToStringID(enumValue);
                return enumString || SENTINELS["string"];
            }
        } catch (e: any) {
            // Failed to get enumeration
        }

        return SENTINELS["string"];
    }

    /**
     * Gets enumeration value as numeric ID
     */
    getEnumerationId(key: string): number {
        if (this._isSentinel || !this.descriptor || !key || key.length === 0) {
            return SENTINELS["integer"];
        }

        try {
            const keyID = stringIDToTypeID(key);
            if (this.descriptor.hasKey(keyID)) {
                return this.descriptor.getEnumerationValue(keyID);
            }
        } catch (e: any) {
            // Failed to get enumeration
        }

        return SENTINELS["integer"];
    }

    /**
     * Gets file path reference
     */
    getPath(key: string): File {
        if (this._isSentinel || !this.descriptor || !key || key.length === 0) {
            return SENTINELS["file"];
        }

        try {
            const keyID = stringIDToTypeID(key);
            if (this.descriptor.hasKey(keyID)) {
                return this.descriptor.getPath(keyID) || SENTINELS["file"];
            }
        } catch (e: any) {
            // Failed to get path
        }

        return SENTINELS["file"];
    }

    /**
     * Gets ActionReference object
     */
    getReference(key: string): ActionReference {
        if (this._isSentinel || !this.descriptor || !key || key.length === 0) {
            return SENTINELS["reference"];
        }

        try {
            const keyID = stringIDToTypeID(key);
            if (this.descriptor.hasKey(keyID)) {
                return this.descriptor.getReference(keyID) || SENTINELS["reference"];
            }
        } catch (e: any) {
            // Failed to get reference
        }

        return SENTINELS["reference"];
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
        if (this._isSentinel || !this.descriptor || !key || key.length === 0) return SENTINELS["string"];
        try {
            const keyID = stringIDToTypeID(key);
            return this.descriptor.hasKey(keyID) ? (this.descriptor as any)[methodName](keyID) : SENTINELS["string"];
        } catch (e: any) { return SENTINELS["string"]; }
    }

    private getIntegerValue(key: string, methodName: string): number {
        if (this._isSentinel || !this.descriptor || !key || key.length === 0) return SENTINELS["integer"];
        try {
            const keyID = stringIDToTypeID(key);
            return this.descriptor.hasKey(keyID) ? (this.descriptor as any)[methodName](keyID) : SENTINELS["integer"];
        } catch (e: any) { return SENTINELS["integer"]; }
    }

    private getDoubleValue(key: string, methodName: string): number {
        if (this._isSentinel || !this.descriptor || !key || key.length === 0) return SENTINELS["double"];
        try {
            const keyID = stringIDToTypeID(key);
            return this.descriptor.hasKey(keyID) ? (this.descriptor as any)[methodName](keyID) : SENTINELS["double"];
        } catch (e: any) { return SENTINELS["double"]; }
    }

    // ===================================================================
    // UTILITY METHODS
    // ===================================================================

    /**
     * Checks if a key exists in the descriptor
     */
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

    /**
     * Gets bounds information for the current object (typically a layer)
     */
    getBounds(): Rectangle {
        if (this._isSentinel || !this.descriptor) {
            // Create sentinel Rectangle with all sentinel values
            const sentinelRect = new Rectangle();
            sentinelRect.left = SENTINELS["double"];
            sentinelRect.top = SENTINELS["double"];
            sentinelRect.right = SENTINELS["double"];
            sentinelRect.bottom = SENTINELS["double"];
            sentinelRect.width = SENTINELS["double"];
            sentinelRect.height = SENTINELS["double"];
            return sentinelRect;
        }

        try {
            const boundsKeyID = stringIDToTypeID("bounds");
            if (this.descriptor.hasKey(boundsKeyID)) {
                const boundsDesc = this.descriptor.getObjectValue(boundsKeyID);
                const left = boundsDesc.getUnitDoubleValue(stringIDToTypeID("left"));
                const top = boundsDesc.getUnitDoubleValue(stringIDToTypeID("top"));
                const right = boundsDesc.getUnitDoubleValue(stringIDToTypeID("right"));
                const bottom = boundsDesc.getUnitDoubleValue(stringIDToTypeID("bottom"));

                // Create and populate Rectangle using Adobe's existing class
                const rect = new Rectangle();
                rect.left = left;
                rect.top = top;
                rect.right = right;
                rect.bottom = bottom;
                rect.width = right - left;
                rect.height = bottom - top;
                rect.x = left;  // Rectangle also has x,y properties
                rect.y = top;
                return rect;
            }
        } catch (e: any) {
            // Failed to get bounds
        }

        // Fallback to sentinel Rectangle
        const sentinelRect = new Rectangle();
        sentinelRect.left = SENTINELS["double"];
        sentinelRect.top = SENTINELS["double"];
        sentinelRect.right = SENTINELS["double"];
        sentinelRect.bottom = SENTINELS["double"];
        sentinelRect.width = SENTINELS["double"];
        sentinelRect.height = SENTINELS["double"];
        return sentinelRect;
    }

    /**
     * Transform this descriptor using a custom selector function
     */
    select<T>(selector: SelectorFunction<T>): T | null {
        if (this._isSentinel) {
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
                $.writeln(label + ': ' + (this._isSentinel ? 'SENTINEL' : 'OK'));
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
 * Fluent navigation class for ActionList objects
 * Provides LINQ-style collection operations with sentinel error handling
 */
export class ActionListNavigator implements IActionListNavigator {
    private list: ActionList | null;
    private _isSentinel: boolean;

    constructor(list: ActionList | null, isSentinel: boolean = false) {
        this.list = list;
        this._isSentinel = isSentinel || list === null || list === undefined;
    }

    static createSentinel(): ActionListNavigator {
        return new ActionListNavigator(null, true);
    }

    /**
     * Returns true if this navigator represents a sentinel (failed operation)
     */
    get isSentinel(): boolean {
        return this._isSentinel;
    }

    /**
     * Gets the count of items in the list
     */
    getCount(): number {
        if (this._isSentinel || !this.list) {
            return -1;
        }

        try {
            return this.list.count;
        } catch (e: any) {
            return -1;
        }
    }

    /**
     * Gets item at specific index
     */
    getObject(index: number): IActionDescriptorNavigator {
        if (this._isSentinel || !this.list || index < 0) {
            return ActionDescriptorNavigator.createSentinel();
        }

        const listCount = this.getCount();
        if (listCount <= 0 || index >= listCount) {
            return ActionDescriptorNavigator.createSentinel();
        }

        try {
            const obj = this.list.getObjectValue(index);
            return new ActionDescriptorNavigator(obj, false);
        } catch (e: any) {
            return ActionDescriptorNavigator.createSentinel();
        }
    }

    /**
     * Gets the first item that matches the predicate
     */
    getFirstWhere(predicate: PredicateFunction): IActionDescriptorNavigator {
        if (this._isSentinel) {
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
     * Gets exactly one item that matches the predicate
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
     * Gets all items that match the predicate
     */
    getAllWhere(predicate: PredicateFunction): IActionDescriptorNavigator[] {
        if (this._isSentinel) {
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
                // Skip items that cause predicate errors
                continue;
            }
        }

        return results;
    }

    /**
     * Gets an enumerable that matches the predicate (for further chaining)
     */
    whereMatches(predicate: PredicateFunction): IEnumerable {
        const matchingItems = this.getAllWhere(predicate);
        return new SimpleEnumerable(matchingItems);
    }

    /**
     * Transforms each item in the list using the provided function
     */
    select<T>(transformer: SelectorFunction<T>): IEnumerableArray {
        if (this._isSentinel) {
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
                // Skip items that cause transformation errors
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